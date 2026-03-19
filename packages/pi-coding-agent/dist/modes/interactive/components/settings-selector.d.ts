import type { ThinkingLevel } from "@gsd/pi-agent-core";
import type { Transport } from "@gsd/pi-ai";
import { Container, type SelectItem, SettingsList } from "@gsd/pi-tui";
export declare const THINKING_DESCRIPTIONS: Record<ThinkingLevel, string>;
export interface SettingsConfig {
    autoCompact: boolean;
    showImages: boolean;
    autoResizeImages: boolean;
    blockImages: boolean;
    enableSkillCommands: boolean;
    steeringMode: "all" | "one-at-a-time";
    followUpMode: "all" | "one-at-a-time";
    transport: Transport;
    thinkingLevel: ThinkingLevel;
    availableThinkingLevels: ThinkingLevel[];
    currentTheme: string;
    availableThemes: string[];
    hideThinkingBlock: boolean;
    collapseChangelog: boolean;
    doubleEscapeAction: "fork" | "tree" | "none";
    treeFilterMode: "default" | "no-tools" | "user-only" | "labeled-only" | "all";
    showHardwareCursor: boolean;
    editorPaddingX: number;
    autocompleteMaxVisible: number;
    respectGitignoreInPicker: boolean;
    quietStartup: boolean;
    clearOnShrink: boolean;
}
export interface SettingsCallbacks {
    onAutoCompactChange: (enabled: boolean) => void;
    onShowImagesChange: (enabled: boolean) => void;
    onAutoResizeImagesChange: (enabled: boolean) => void;
    onBlockImagesChange: (blocked: boolean) => void;
    onEnableSkillCommandsChange: (enabled: boolean) => void;
    onSteeringModeChange: (mode: "all" | "one-at-a-time") => void;
    onFollowUpModeChange: (mode: "all" | "one-at-a-time") => void;
    onTransportChange: (transport: Transport) => void;
    onThinkingLevelChange: (level: ThinkingLevel) => void;
    onThemeChange: (theme: string) => void;
    onThemePreview?: (theme: string) => void;
    onHideThinkingBlockChange: (hidden: boolean) => void;
    onCollapseChangelogChange: (collapsed: boolean) => void;
    onDoubleEscapeActionChange: (action: "fork" | "tree" | "none") => void;
    onTreeFilterModeChange: (mode: "default" | "no-tools" | "user-only" | "labeled-only" | "all") => void;
    onShowHardwareCursorChange: (enabled: boolean) => void;
    onEditorPaddingXChange: (padding: number) => void;
    onAutocompleteMaxVisibleChange: (maxVisible: number) => void;
    onRespectGitignoreInPickerChange: (enabled: boolean) => void;
    onQuietStartupChange: (enabled: boolean) => void;
    onClearOnShrinkChange: (enabled: boolean) => void;
    onCancel: () => void;
}
/**
 * A submenu component for selecting from a list of options.
 */
export declare class SelectSubmenu extends Container {
    private selectList;
    constructor(title: string, description: string, options: SelectItem[], currentValue: string, onSelect: (value: string) => void, onCancel: () => void, onSelectionChange?: (value: string) => void);
    handleInput(data: string): void;
}
/**
 * Main settings selector component.
 */
export declare class SettingsSelectorComponent extends Container {
    private settingsList;
    constructor(config: SettingsConfig, callbacks: SettingsCallbacks);
    getSettingsList(): SettingsList;
}
//# sourceMappingURL=settings-selector.d.ts.map