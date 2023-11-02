"use strict";
import { window, commands, version } from "vscode";
import { TextEditorHelper } from "./textEditorHelper";
export class MarkdownPreview {
    // @Override
    static sendPreviewCommand(_previewUri, displayColumn) {
        let command = MarkdownPreview.getPreviewCommandTag(displayColumn);
        if (command != this.COMMAND_BUTT) {
            return commands.executeCommand(command).then(() => { }, (reason) => {
                console.warn(reason);
                window.showErrorMessage(reason);
            });
        }
        return Promise.resolve();
    }
    static getPreviewCommandTag(displayColumn) {
        if (!window.activeTextEditor) {
            return "";
        }
        if (displayColumn == window.activeTextEditor.viewColumn) {
            return MarkdownPreview.getCommandTogglePreview();
        }
        return MarkdownPreview.getCommandOpenPreviewSideBySide();
    }
    static getCommandTogglePreview() {
        if (TextEditorHelper.versionCompare(version, "1.3.0") < 0) {
            return MarkdownPreview.COMMAND_TOGGLE_PREVIEW;
        }
        return MarkdownPreview.COMMAND_TOGGLE_PREVIEW_1_3_0;
    }
    static getCommandOpenPreviewSideBySide() {
        if (TextEditorHelper.versionCompare(version, "1.3.0") < 0) {
            return MarkdownPreview.COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE;
        }
        return MarkdownPreview.COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE_1_3_0;
    }
}
MarkdownPreview.COMMAND_TOGGLE_PREVIEW = "workbench.action.markdown.togglePreview";
MarkdownPreview.COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE = "workbench.action.markdown.openPreviewSideBySide";
MarkdownPreview.COMMAND_TOGGLE_PREVIEW_1_3_0 = "markdown.showPreview";
MarkdownPreview.COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE_1_3_0 = "markdown.showPreviewToSide";
MarkdownPreview.COMMAND_BUTT = "";
//# sourceMappingURL=markdownPreview.js.map