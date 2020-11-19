"use strict";
import { window, commands, ViewColumn, version, Uri } from "vscode";
import { TextEditorHelper } from "./textEditorHelper"

export class MarkdownPreview {
    public static COMMAND_TOGGLE_PREVIEW: string = "workbench.action.markdown.togglePreview";
    public static COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE: string = "workbench.action.markdown.openPreviewSideBySide";
    public static COMMAND_TOGGLE_PREVIEW_1_3_0: string = "markdown.showPreview";
    public static COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE_1_3_0: string = "markdown.showPreviewToSide";
    public static COMMAND_BUTT: string = "";

    // @Override
    public static sendPreviewCommand(_previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        let command: string = MarkdownPreview.getPreviewCommandTag(displayColumn);
        if (command != this.COMMAND_BUTT) {
            return commands.executeCommand(command).then(() => { }, (reason) => {
                console.warn(reason);
                window.showErrorMessage(reason);
            });
        }
        return Promise.resolve();
    }
    private static getPreviewCommandTag(displayColumn: ViewColumn): string {
        if(!window.activeTextEditor){
            return ""
        }
        if (displayColumn == window.activeTextEditor.viewColumn) {
            return MarkdownPreview.getCommandTogglePreview();
        }
        return MarkdownPreview.getCommandOpenPreviewSideBySide();
    }

    private static getCommandTogglePreview(): string {
        if (TextEditorHelper.versionCompare(version, "1.3.0") < 0) {
            return MarkdownPreview.COMMAND_TOGGLE_PREVIEW
        }
        return MarkdownPreview.COMMAND_TOGGLE_PREVIEW_1_3_0;
    }
    private static getCommandOpenPreviewSideBySide(): string {
        if (TextEditorHelper.versionCompare(version, "1.3.0") < 0) {
            return MarkdownPreview.COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE
        }
        return MarkdownPreview.COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE_1_3_0;
    }
}