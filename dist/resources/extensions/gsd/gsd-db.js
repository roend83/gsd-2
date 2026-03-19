// GSD Database Abstraction Layer
// Provides a SQLite database with provider fallback chain:
//   node:sqlite (built-in) → better-sqlite3 (npm) → null (unavailable)
//
// Exposes a unified sync API for decisions and requirements storage.
// Schema is initialized on first open with WAL mode for file-backed DBs.
import { createRequire } from 'node:module';
import { GSDError, GSD_STALE_STATE } from './errors.js';
// Create a require function for loading native modules in ESM context
const _require = createRequire(import.meta.url);
let providerName = null;
let providerModule = null;
let loadAttempted = false;
/**
 * Suppress the ExperimentalWarning for SQLite from node:sqlite.
 * Must be called before require('node:sqlite').
 */
function suppressSqliteWarning() {
    const origEmit = process.emit;
    // @ts-expect-error — overriding process.emit with filtered version
    process.emit = function (event, ...args) {
        if (event === 'warning' &&
            args[0] &&
            typeof args[0] === 'object' &&
            'name' in args[0] &&
            args[0].name === 'ExperimentalWarning' &&
            'message' in args[0] &&
            typeof args[0].message === 'string' &&
            args[0].message.includes('SQLite')) {
            return false;
        }
        return origEmit.apply(process, [event, ...args]);
    };
}
function loadProvider() {
    if (loadAttempted)
        return;
    loadAttempted = true;
    // Try node:sqlite first
    try {
        suppressSqliteWarning();
        const mod = _require('node:sqlite');
        if (mod.DatabaseSync) {
            providerModule = mod;
            providerName = 'node:sqlite';
            return;
        }
    }
    catch {
        // node:sqlite not available
    }
    // Try better-sqlite3
    try {
        const mod = _require('better-sqlite3');
        if (typeof mod === 'function' || (mod && mod.default)) {
            providerModule = mod.default || mod;
            providerName = 'better-sqlite3';
            return;
        }
    }
    catch {
        // better-sqlite3 not available
    }
    process.stderr.write('gsd-db: No SQLite provider available (tried node:sqlite, better-sqlite3)\n');
}
// ─── Database Adapter ──────────────────────────────────────────────────────
/**
 * Normalize a row from node:sqlite (null-prototype) to a plain object.
 */
function normalizeRow(row) {
    if (row == null)
        return undefined;
    if (Object.getPrototypeOf(row) === null) {
        return { ...row };
    }
    return row;
}
function normalizeRows(rows) {
    return rows.map(r => normalizeRow(r));
}
function createAdapter(rawDb) {
    const db = rawDb;
    return {
        exec(sql) {
            db.exec(sql);
        },
        prepare(sql) {
            const stmt = db.prepare(sql);
            return {
                run(...params) {
                    stmt.run(...params);
                },
                get(...params) {
                    return normalizeRow(stmt.get(...params));
                },
                all(...params) {
                    return normalizeRows(stmt.all(...params));
                },
            };
        },
        close() {
            db.close();
        },
    };
}
function openRawDb(path) {
    loadProvider();
    if (!providerModule || !providerName)
        return null;
    if (providerName === 'node:sqlite') {
        const { DatabaseSync } = providerModule;
        return new DatabaseSync(path);
    }
    // better-sqlite3
    const Database = providerModule;
    return new Database(path);
}
// ─── Schema ────────────────────────────────────────────────────────────────
const SCHEMA_VERSION = 3;
function initSchema(db, fileBacked) {
    // WAL mode for file-backed databases (must be outside transaction)
    if (fileBacked) {
        db.exec('PRAGMA journal_mode=WAL');
    }
    db.exec('BEGIN');
    try {
        db.exec(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER NOT NULL,
        applied_at TEXT NOT NULL
      )
    `);
        db.exec(`
      CREATE TABLE IF NOT EXISTS decisions (
        seq INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT NOT NULL UNIQUE,
        when_context TEXT NOT NULL DEFAULT '',
        scope TEXT NOT NULL DEFAULT '',
        decision TEXT NOT NULL DEFAULT '',
        choice TEXT NOT NULL DEFAULT '',
        rationale TEXT NOT NULL DEFAULT '',
        revisable TEXT NOT NULL DEFAULT '',
        superseded_by TEXT DEFAULT NULL
      )
    `);
        db.exec(`
      CREATE TABLE IF NOT EXISTS requirements (
        id TEXT PRIMARY KEY,
        class TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        why TEXT NOT NULL DEFAULT '',
        source TEXT NOT NULL DEFAULT '',
        primary_owner TEXT NOT NULL DEFAULT '',
        supporting_slices TEXT NOT NULL DEFAULT '',
        validation TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        full_content TEXT NOT NULL DEFAULT '',
        superseded_by TEXT DEFAULT NULL
      )
    `);
        db.exec(`
      CREATE TABLE IF NOT EXISTS artifacts (
        path TEXT PRIMARY KEY,
        artifact_type TEXT NOT NULL DEFAULT '',
        milestone_id TEXT DEFAULT NULL,
        slice_id TEXT DEFAULT NULL,
        task_id TEXT DEFAULT NULL,
        full_content TEXT NOT NULL DEFAULT '',
        imported_at TEXT NOT NULL DEFAULT ''
      )
    `);
        db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        seq INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        content TEXT NOT NULL,
        confidence REAL NOT NULL DEFAULT 0.8,
        source_unit_type TEXT,
        source_unit_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        superseded_by TEXT DEFAULT NULL,
        hit_count INTEGER NOT NULL DEFAULT 0
      )
    `);
        db.exec(`
      CREATE TABLE IF NOT EXISTS memory_processed_units (
        unit_key TEXT PRIMARY KEY,
        activity_file TEXT,
        processed_at TEXT NOT NULL
      )
    `);
        db.exec('CREATE INDEX IF NOT EXISTS idx_memories_active ON memories(superseded_by)');
        // Views — DROP + CREATE since CREATE VIEW IF NOT EXISTS doesn't update definitions
        db.exec(`CREATE VIEW IF NOT EXISTS active_decisions AS SELECT * FROM decisions WHERE superseded_by IS NULL`);
        db.exec(`CREATE VIEW IF NOT EXISTS active_requirements AS SELECT * FROM requirements WHERE superseded_by IS NULL`);
        db.exec(`CREATE VIEW IF NOT EXISTS active_memories AS SELECT * FROM memories WHERE superseded_by IS NULL`);
        // Insert schema version if not already present
        const existing = db.prepare('SELECT count(*) as cnt FROM schema_version').get();
        if (existing && existing['cnt'] === 0) {
            db.prepare('INSERT INTO schema_version (version, applied_at) VALUES (:version, :applied_at)').run({ ':version': SCHEMA_VERSION, ':applied_at': new Date().toISOString() });
        }
        db.exec('COMMIT');
    }
    catch (err) {
        db.exec('ROLLBACK');
        throw err;
    }
    // Run incremental migrations for existing databases
    migrateSchema(db);
}
/**
 * Incremental schema migration. Reads current version from schema_version table
 * and applies DDL for each version step up to SCHEMA_VERSION.
 */
function migrateSchema(db) {
    const row = db.prepare('SELECT MAX(version) as v FROM schema_version').get();
    const currentVersion = row ? row['v'] : 0;
    if (currentVersion >= SCHEMA_VERSION)
        return;
    db.exec('BEGIN');
    try {
        // v1 → v2: add artifacts table
        if (currentVersion < 2) {
            db.exec(`
        CREATE TABLE IF NOT EXISTS artifacts (
          path TEXT PRIMARY KEY,
          artifact_type TEXT NOT NULL DEFAULT '',
          milestone_id TEXT DEFAULT NULL,
          slice_id TEXT DEFAULT NULL,
          task_id TEXT DEFAULT NULL,
          full_content TEXT NOT NULL DEFAULT '',
          imported_at TEXT NOT NULL DEFAULT ''
        )
      `);
            db.prepare('INSERT INTO schema_version (version, applied_at) VALUES (:version, :applied_at)').run({ ':version': 2, ':applied_at': new Date().toISOString() });
        }
        // v2 → v3: add memories + memory_processed_units tables
        if (currentVersion < 3) {
            db.exec(`
        CREATE TABLE IF NOT EXISTS memories (
          seq INTEGER PRIMARY KEY AUTOINCREMENT,
          id TEXT NOT NULL UNIQUE,
          category TEXT NOT NULL,
          content TEXT NOT NULL,
          confidence REAL NOT NULL DEFAULT 0.8,
          source_unit_type TEXT,
          source_unit_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          superseded_by TEXT DEFAULT NULL,
          hit_count INTEGER NOT NULL DEFAULT 0
        )
      `);
            db.exec(`
        CREATE TABLE IF NOT EXISTS memory_processed_units (
          unit_key TEXT PRIMARY KEY,
          activity_file TEXT,
          processed_at TEXT NOT NULL
        )
      `);
            db.exec('CREATE INDEX IF NOT EXISTS idx_memories_active ON memories(superseded_by)');
            db.exec('DROP VIEW IF EXISTS active_memories');
            db.exec('CREATE VIEW active_memories AS SELECT * FROM memories WHERE superseded_by IS NULL');
            db.prepare('INSERT INTO schema_version (version, applied_at) VALUES (:version, :applied_at)').run({ ':version': 3, ':applied_at': new Date().toISOString() });
        }
        db.exec('COMMIT');
    }
    catch (err) {
        db.exec('ROLLBACK');
        throw err;
    }
}
// ─── Module State ──────────────────────────────────────────────────────────
let currentDb = null;
let currentPath = null;
/** PID that opened the current connection — used for diagnostic logging. */
let currentPid = 0;
// ─── Public API ────────────────────────────────────────────────────────────
/**
 * Returns which SQLite provider is available, or null if none.
 */
export function getDbProvider() {
    loadProvider();
    return providerName;
}
/**
 * Returns true if a database is currently open and usable.
 */
export function isDbAvailable() {
    return currentDb !== null;
}
/**
 * Opens (or creates) a SQLite database at the given path.
 * Initializes schema if needed. Sets WAL mode for file-backed DBs.
 * Returns true on success, false if no provider is available.
 */
export function openDatabase(path) {
    // Close existing if different path
    if (currentDb && currentPath !== path) {
        closeDatabase();
    }
    if (currentDb && currentPath === path) {
        return true; // already open
    }
    const rawDb = openRawDb(path);
    if (!rawDb)
        return false;
    const adapter = createAdapter(rawDb);
    const fileBacked = path !== ':memory:';
    try {
        initSchema(adapter, fileBacked);
    }
    catch (err) {
        try {
            adapter.close();
        }
        catch { /* swallow */ }
        throw err;
    }
    currentDb = adapter;
    currentPath = path;
    currentPid = process.pid;
    return true;
}
/**
 * Closes the current database connection.
 */
export function closeDatabase() {
    if (currentDb) {
        try {
            currentDb.close();
        }
        catch {
            // swallow close errors
        }
        currentDb = null;
        currentPath = null;
        currentPid = 0;
    }
}
/**
 * Runs a function inside a transaction. Rolls back on error.
 */
export function transaction(fn) {
    if (!currentDb)
        throw new GSDError(GSD_STALE_STATE, 'gsd-db: No database open');
    currentDb.exec('BEGIN');
    try {
        const result = fn();
        currentDb.exec('COMMIT');
        return result;
    }
    catch (err) {
        currentDb.exec('ROLLBACK');
        throw err;
    }
}
// ─── Decision Wrappers ────────────────────────────────────────────────────
/**
 * Insert a decision. The `seq` field is auto-generated.
 */
export function insertDecision(d) {
    if (!currentDb)
        throw new GSDError(GSD_STALE_STATE, 'gsd-db: No database open');
    currentDb.prepare(`INSERT INTO decisions (id, when_context, scope, decision, choice, rationale, revisable, superseded_by)
     VALUES (:id, :when_context, :scope, :decision, :choice, :rationale, :revisable, :superseded_by)`).run({
        ':id': d.id,
        ':when_context': d.when_context,
        ':scope': d.scope,
        ':decision': d.decision,
        ':choice': d.choice,
        ':rationale': d.rationale,
        ':revisable': d.revisable,
        ':superseded_by': d.superseded_by,
    });
}
/**
 * Get a decision by its ID (e.g. "D001"). Returns null if not found.
 */
export function getDecisionById(id) {
    if (!currentDb)
        return null;
    const row = currentDb.prepare('SELECT * FROM decisions WHERE id = ?').get(id);
    if (!row)
        return null;
    return {
        seq: row['seq'],
        id: row['id'],
        when_context: row['when_context'],
        scope: row['scope'],
        decision: row['decision'],
        choice: row['choice'],
        rationale: row['rationale'],
        revisable: row['revisable'],
        superseded_by: row['superseded_by'] ?? null,
    };
}
/**
 * Get all active (non-superseded) decisions.
 */
export function getActiveDecisions() {
    if (!currentDb)
        return [];
    const rows = currentDb.prepare('SELECT * FROM active_decisions').all();
    return rows.map(row => ({
        seq: row['seq'],
        id: row['id'],
        when_context: row['when_context'],
        scope: row['scope'],
        decision: row['decision'],
        choice: row['choice'],
        rationale: row['rationale'],
        revisable: row['revisable'],
        superseded_by: null,
    }));
}
// ─── Requirement Wrappers ─────────────────────────────────────────────────
/**
 * Insert a requirement.
 */
export function insertRequirement(r) {
    if (!currentDb)
        throw new GSDError(GSD_STALE_STATE, 'gsd-db: No database open');
    currentDb.prepare(`INSERT INTO requirements (id, class, status, description, why, source, primary_owner, supporting_slices, validation, notes, full_content, superseded_by)
     VALUES (:id, :class, :status, :description, :why, :source, :primary_owner, :supporting_slices, :validation, :notes, :full_content, :superseded_by)`).run({
        ':id': r.id,
        ':class': r.class,
        ':status': r.status,
        ':description': r.description,
        ':why': r.why,
        ':source': r.source,
        ':primary_owner': r.primary_owner,
        ':supporting_slices': r.supporting_slices,
        ':validation': r.validation,
        ':notes': r.notes,
        ':full_content': r.full_content,
        ':superseded_by': r.superseded_by,
    });
}
/**
 * Get a requirement by its ID (e.g. "R001"). Returns null if not found.
 */
export function getRequirementById(id) {
    if (!currentDb)
        return null;
    const row = currentDb.prepare('SELECT * FROM requirements WHERE id = ?').get(id);
    if (!row)
        return null;
    return {
        id: row['id'],
        class: row['class'],
        status: row['status'],
        description: row['description'],
        why: row['why'],
        source: row['source'],
        primary_owner: row['primary_owner'],
        supporting_slices: row['supporting_slices'],
        validation: row['validation'],
        notes: row['notes'],
        full_content: row['full_content'],
        superseded_by: row['superseded_by'] ?? null,
    };
}
/**
 * Get all active (non-superseded) requirements.
 */
export function getActiveRequirements() {
    if (!currentDb)
        return [];
    const rows = currentDb.prepare('SELECT * FROM active_requirements').all();
    return rows.map(row => ({
        id: row['id'],
        class: row['class'],
        status: row['status'],
        description: row['description'],
        why: row['why'],
        source: row['source'],
        primary_owner: row['primary_owner'],
        supporting_slices: row['supporting_slices'],
        validation: row['validation'],
        notes: row['notes'],
        full_content: row['full_content'],
        superseded_by: null,
    }));
}
/**
 * Returns the PID of the process that opened the current DB connection.
 * Returns 0 if no connection is open.
 */
export function getDbOwnerPid() {
    return currentPid;
}
/**
 * Returns the path of the currently open database, or null if none.
 */
export function getDbPath() {
    return currentPath;
}
// ─── Internal Access (for testing) ─────────────────────────────────────────
/**
 * Get the raw adapter for direct queries (testing only).
 */
export function _getAdapter() {
    return currentDb;
}
/**
 * Reset provider state (testing only — allows re-detection).
 */
export function _resetProvider() {
    loadAttempted = false;
    providerModule = null;
    providerName = null;
}
// ─── Upsert Wrappers (for idempotent import) ─────────────────────────────
/**
 * Insert or replace a decision. Uses the `id` UNIQUE constraint for idempotency.
 */
export function upsertDecision(d) {
    if (!currentDb)
        throw new GSDError(GSD_STALE_STATE, 'gsd-db: No database open');
    currentDb.prepare(`INSERT OR REPLACE INTO decisions (id, when_context, scope, decision, choice, rationale, revisable, superseded_by)
     VALUES (:id, :when_context, :scope, :decision, :choice, :rationale, :revisable, :superseded_by)`).run({
        ':id': d.id,
        ':when_context': d.when_context,
        ':scope': d.scope,
        ':decision': d.decision,
        ':choice': d.choice,
        ':rationale': d.rationale,
        ':revisable': d.revisable,
        ':superseded_by': d.superseded_by ?? null,
    });
}
/**
 * Insert or replace a requirement. Uses the `id` PK for idempotency.
 */
export function upsertRequirement(r) {
    if (!currentDb)
        throw new GSDError(GSD_STALE_STATE, 'gsd-db: No database open');
    currentDb.prepare(`INSERT OR REPLACE INTO requirements (id, class, status, description, why, source, primary_owner, supporting_slices, validation, notes, full_content, superseded_by)
     VALUES (:id, :class, :status, :description, :why, :source, :primary_owner, :supporting_slices, :validation, :notes, :full_content, :superseded_by)`).run({
        ':id': r.id,
        ':class': r.class,
        ':status': r.status,
        ':description': r.description,
        ':why': r.why,
        ':source': r.source,
        ':primary_owner': r.primary_owner,
        ':supporting_slices': r.supporting_slices,
        ':validation': r.validation,
        ':notes': r.notes,
        ':full_content': r.full_content,
        ':superseded_by': r.superseded_by ?? null,
    });
}
/**
 * Insert or replace an artifact. Uses the `path` PK for idempotency.
 */
/**
 * Delete all rows from the artifacts table.
 * The artifacts table is a read cache — clearing it forces the next
 * deriveState() to fall through to disk reads (native Rust batch parse).
 * Safe to call when no database is open (no-op).
 */
export function clearArtifacts() {
    if (!currentDb)
        return;
    try {
        currentDb.exec('DELETE FROM artifacts');
    }
    catch {
        // Clearing a cache should never be fatal
    }
}
export function insertArtifact(a) {
    if (!currentDb)
        throw new GSDError(GSD_STALE_STATE, 'gsd-db: No database open');
    currentDb.prepare(`INSERT OR REPLACE INTO artifacts (path, artifact_type, milestone_id, slice_id, task_id, full_content, imported_at)
     VALUES (:path, :artifact_type, :milestone_id, :slice_id, :task_id, :full_content, :imported_at)`).run({
        ':path': a.path,
        ':artifact_type': a.artifact_type,
        ':milestone_id': a.milestone_id,
        ':slice_id': a.slice_id,
        ':task_id': a.task_id,
        ':full_content': a.full_content,
        ':imported_at': new Date().toISOString(),
    });
}
