/**
 * SQLite storage for the memory extraction pipeline.
 *
 * Tables:
 * - threads: tracks session files and their processing state
 * - stage1_outputs: stores per-thread extraction results
 * - jobs: lease-based job queue for pipeline phases
 */
import initSqlJs from "sql.js";
import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
export class MemoryStorage {
    constructor(db, dbPath) {
        this.persistTimer = null;
        this.db = db;
        this.dbPath = dbPath;
    }
    static async create(dbPath) {
        const dir = dirname(dbPath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        const SQL = await initSqlJs();
        const buffer = existsSync(dbPath) ? readFileSync(dbPath) : undefined;
        const db = buffer ? new SQL.Database(buffer) : new SQL.Database();
        db.run("PRAGMA journal_mode = WAL");
        db.run("PRAGMA synchronous = NORMAL");
        db.run("PRAGMA busy_timeout = 5000");
        const storage = new MemoryStorage(db, dbPath);
        storage.initSchema();
        return storage;
    }
    persist() {
        const data = this.db.export();
        writeFileSync(this.dbPath, Buffer.from(data));
    }
    schedulePersist() {
        if (this.persistTimer) {
            clearTimeout(this.persistTimer);
        }
        this.persistTimer = setTimeout(() => {
            this.persistTimer = null;
            this.persist();
        }, 500);
    }
    initSchema() {
        this.db.run(`
			CREATE TABLE IF NOT EXISTS threads (
				thread_id TEXT PRIMARY KEY,
				file_path TEXT NOT NULL,
				file_size INTEGER NOT NULL DEFAULT 0,
				file_mtime INTEGER NOT NULL DEFAULT 0,
				cwd TEXT NOT NULL DEFAULT '',
				status TEXT NOT NULL DEFAULT 'pending',
				error_message TEXT,
				created_at TEXT NOT NULL DEFAULT (datetime('now')),
				updated_at TEXT NOT NULL DEFAULT (datetime('now'))
			)
		`);
        this.db.run(`
			CREATE TABLE IF NOT EXISTS stage1_outputs (
				thread_id TEXT PRIMARY KEY,
				extraction_json TEXT NOT NULL,
				created_at TEXT NOT NULL DEFAULT (datetime('now')),
				FOREIGN KEY (thread_id) REFERENCES threads(thread_id) ON DELETE CASCADE
			)
		`);
        this.db.run(`
			CREATE TABLE IF NOT EXISTS jobs (
				id TEXT PRIMARY KEY,
				phase TEXT NOT NULL,
				thread_id TEXT,
				status TEXT NOT NULL DEFAULT 'pending',
				worker_id TEXT,
				ownership_token TEXT,
				lease_expires_at TEXT,
				error_message TEXT,
				created_at TEXT NOT NULL DEFAULT (datetime('now')),
				updated_at TEXT NOT NULL DEFAULT (datetime('now'))
			)
		`);
        this.db.run("CREATE INDEX IF NOT EXISTS idx_jobs_phase_status ON jobs(phase, status)");
        this.db.run("CREATE INDEX IF NOT EXISTS idx_threads_status ON threads(status)");
        this.db.run("CREATE INDEX IF NOT EXISTS idx_threads_cwd ON threads(cwd)");
        this.persist();
    }
    queryAll(sql, params = []) {
        const stmt = this.db.prepare(sql);
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    }
    queryOne(sql, params = []) {
        const rows = this.queryAll(sql, params);
        return rows[0];
    }
    /**
     * Insert or update thread records. Skips threads whose file hasn't changed
     * (same size + mtime = watermark match).
     */
    upsertThreads(threads) {
        let inserted = 0;
        let updated = 0;
        let skipped = 0;
        for (const t of threads) {
            const existing = this.queryOne("SELECT file_size, file_mtime, status FROM threads WHERE thread_id = ?", [t.threadId]);
            if (!existing) {
                this.db.run("INSERT INTO threads (thread_id, file_path, file_size, file_mtime, cwd, status) VALUES (?, ?, ?, ?, ?, 'pending')", [t.threadId, t.filePath, t.fileSize, t.fileMtime, t.cwd]);
                this.db.run("INSERT OR IGNORE INTO jobs (id, phase, thread_id, status) VALUES (?, 'stage1', ?, 'pending')", [randomUUID(), t.threadId]);
                inserted++;
            }
            else if (existing.file_size !== t.fileSize || existing.file_mtime !== t.fileMtime) {
                this.db.run("UPDATE threads SET file_path = ?, file_size = ?, file_mtime = ?, cwd = ?, status = 'pending', updated_at = datetime('now') WHERE thread_id = ?", [t.filePath, t.fileSize, t.fileMtime, t.cwd, t.threadId]);
                if (existing.status === "done" || existing.status === "error") {
                    this.db.run("INSERT OR IGNORE INTO jobs (id, phase, thread_id, status) VALUES (?, 'stage1', ?, 'pending')", [randomUUID(), t.threadId]);
                }
                updated++;
            }
            else {
                skipped++;
            }
        }
        this.schedulePersist();
        return { inserted, updated, skipped };
    }
    /**
     * Claim up to `limit` stage1 jobs for the given worker.
     * Uses lease-based ownership with an ownership_token UUID.
     */
    claimStage1Jobs(workerId, limit, leaseSeconds) {
        const token = randomUUID();
        const expiresAt = new Date(Date.now() + leaseSeconds * 1000).toISOString();
        this.db.run(`UPDATE jobs SET
				status = 'claimed',
				worker_id = ?,
				ownership_token = ?,
				lease_expires_at = ?,
				updated_at = datetime('now')
			WHERE id IN (
				SELECT id FROM jobs
				WHERE phase = 'stage1'
					AND (status = 'pending' OR (status = 'claimed' AND lease_expires_at < datetime('now')))
				LIMIT ?
			)`, [workerId, token, expiresAt, limit]);
        const rows = this.queryAll("SELECT id, thread_id FROM jobs WHERE ownership_token = ? AND status = 'claimed'", [token]);
        this.schedulePersist();
        return rows.map((r) => ({
            jobId: r.id,
            threadId: r.thread_id,
            ownershipToken: token,
        }));
    }
    /**
     * Mark a stage1 job as complete and store the extraction output.
     */
    completeStage1Job(threadId, output) {
        this.db.run("UPDATE jobs SET status = 'done', updated_at = datetime('now') WHERE thread_id = ? AND phase = 'stage1' AND status = 'claimed'", [threadId]);
        this.db.run("INSERT OR REPLACE INTO stage1_outputs (thread_id, extraction_json, created_at) VALUES (?, ?, datetime('now'))", [threadId, output]);
        this.db.run("UPDATE threads SET status = 'done', updated_at = datetime('now') WHERE thread_id = ?", [threadId]);
        this.schedulePersist();
    }
    /**
     * Mark a stage1 job as errored.
     */
    failStage1Job(threadId, errorMessage) {
        this.db.run("UPDATE jobs SET status = 'error', error_message = ?, updated_at = datetime('now') WHERE thread_id = ? AND phase = 'stage1' AND status = 'claimed'", [errorMessage, threadId]);
        this.db.run("UPDATE threads SET status = 'error', error_message = ?, updated_at = datetime('now') WHERE thread_id = ?", [errorMessage, threadId]);
        this.schedulePersist();
    }
    /**
     * Try to claim the global phase 2 consolidation job.
     * Only one worker can hold this at a time.
     */
    tryClaimGlobalPhase2Job(workerId, leaseSeconds) {
        const token = randomUUID();
        const expiresAt = new Date(Date.now() + leaseSeconds * 1000).toISOString();
        const pendingStage1 = this.queryOne("SELECT COUNT(*) as cnt FROM jobs WHERE phase = 'stage1' AND status IN ('pending', 'claimed')");
        if (pendingStage1 && pendingStage1.cnt > 0) {
            return null;
        }
        const existingPhase2 = this.queryOne("SELECT id FROM jobs WHERE phase = 'stage2' AND status = 'claimed' AND lease_expires_at > datetime('now')");
        if (existingPhase2) {
            return null;
        }
        const outputCount = this.queryOne("SELECT COUNT(*) as cnt FROM stage1_outputs");
        if (!outputCount || outputCount.cnt === 0) {
            return null;
        }
        const jobId = randomUUID();
        this.db.run("INSERT INTO jobs (id, phase, status, worker_id, ownership_token, lease_expires_at) VALUES (?, 'stage2', 'claimed', ?, ?, ?)", [jobId, workerId, token, expiresAt]);
        this.schedulePersist();
        return { jobId, ownershipToken: token };
    }
    /**
     * Complete the phase 2 consolidation job.
     */
    completePhase2Job(jobId) {
        this.db.run("UPDATE jobs SET status = 'done', updated_at = datetime('now') WHERE id = ? AND phase = 'stage2'", [jobId]);
        this.schedulePersist();
    }
    /**
     * Get all stage1 extraction outputs.
     */
    getStage1Outputs() {
        const rows = this.queryAll("SELECT thread_id, extraction_json FROM stage1_outputs");
        return rows.map((r) => ({
            threadId: r.thread_id,
            extractionJson: r.extraction_json,
        }));
    }
    /**
     * Get all stage1 outputs for a specific cwd.
     */
    getStage1OutputsForCwd(cwd) {
        const rows = this.queryAll(`SELECT s.thread_id, s.extraction_json FROM stage1_outputs s
			INNER JOIN threads t ON t.thread_id = s.thread_id
			WHERE t.cwd = ?`, [cwd]);
        return rows.map((r) => ({
            threadId: r.thread_id,
            extractionJson: r.extraction_json,
        }));
    }
    /**
     * Get thread info by ID.
     */
    getThread(threadId) {
        return this.queryOne("SELECT * FROM threads WHERE thread_id = ?", [threadId]);
    }
    /**
     * Get pipeline statistics.
     */
    getStats() {
        const threads = this.queryOne(`
			SELECT
				COUNT(*) as total,
				SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
				SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
				SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors
			FROM threads
		`);
        const outputs = this.queryOne("SELECT COUNT(*) as cnt FROM stage1_outputs");
        const pendingJobs = this.queryOne("SELECT COUNT(*) as cnt FROM jobs WHERE phase = 'stage1' AND status IN ('pending', 'claimed')");
        return {
            totalThreads: threads.total,
            pendingThreads: threads.pending,
            doneThreads: threads.done,
            errorThreads: threads.errors,
            totalStage1Outputs: outputs.cnt,
            pendingStage1Jobs: pendingJobs.cnt,
        };
    }
    /**
     * Clear all data (for /memory clear).
     */
    clearAll() {
        this.db.run("DELETE FROM stage1_outputs");
        this.db.run("DELETE FROM jobs");
        this.db.run("DELETE FROM threads");
        this.schedulePersist();
    }
    /**
     * Clear data for a specific cwd (for /memory clear in project scope).
     */
    clearForCwd(cwd) {
        this.db.run("DELETE FROM stage1_outputs WHERE thread_id IN (SELECT thread_id FROM threads WHERE cwd = ?)", [cwd]);
        this.db.run("DELETE FROM jobs WHERE thread_id IN (SELECT thread_id FROM threads WHERE cwd = ?)", [cwd]);
        this.db.run("DELETE FROM threads WHERE cwd = ?", [cwd]);
        this.schedulePersist();
    }
    /**
     * Reset all threads to pending (for /memory rebuild).
     */
    resetAllForCwd(cwd) {
        this.db.run("DELETE FROM stage1_outputs WHERE thread_id IN (SELECT thread_id FROM threads WHERE cwd = ?)", [cwd]);
        this.db.run("DELETE FROM jobs WHERE thread_id IN (SELECT thread_id FROM threads WHERE cwd = ?)", [cwd]);
        this.db.run("UPDATE threads SET status = 'pending', updated_at = datetime('now') WHERE cwd = ?", [cwd]);
        const threads = this.queryAll("SELECT thread_id FROM threads WHERE cwd = ?", [cwd]);
        for (const t of threads) {
            this.db.run("INSERT INTO jobs (id, phase, thread_id, status) VALUES (?, 'stage1', ?, 'pending')", [randomUUID(), t.thread_id]);
        }
        this.schedulePersist();
    }
    close() {
        if (this.persistTimer) {
            clearTimeout(this.persistTimer);
            this.persistTimer = null;
        }
        this.persist();
        this.db.close();
    }
}
//# sourceMappingURL=storage.js.map