"use strict";
import {
    workspace,
    window,
    ExtensionContext,
    commands,
    TextEditor,
    TextDocumentContentProvider,
    EventEmitter,
    Event,
    Uri,
    TextDocumentChangeEvent,
    ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument,
    Disposable,
    version
} from "vscode";
import {
    TextUtil
} from "./textUtil"
import * as path from "path";
let fileUrl = require("file-url");


enum PreviewWindowType {
    OVERRIDE,
    SIDE_BY_SIDE
}

export class MarkDownUtil {
    public static COMMAND_TOGGLE_PREVIEW: string = "workbench.action.markdown.togglePreview";
    public static COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE: string = "workbench.action.markdown.openPreviewSideBySide";
    public static COMMAND_TOGGLE_PREVIEW_1_3_0: string = "markdown.showPreview";
    public static COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE_1_3_0: string = "markdown.showPreviewToSide";
    public static COMMAND_BUTT: string = "";

    // @Override
    public static sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable < void > {
        let command: string = MarkDownUtil.getPreviewCommandTag(displayColumn);
        if (command != this.COMMAND_BUTT) {
            return commands.executeCommand(command).then((success) => {}, (reason) => {
                console.warn(reason);
                window.showErrorMessage(reason);
            });
        }

    }
    private static getPreviewCommandTag(displayColumn: ViewColumn): string {
        if (displayColumn == window.activeTextEditor.viewColumn) {
            return MarkDownUtil.getCommandTogglePreview();
        }
        return MarkDownUtil.getCommandOpenPreviewSideBySide();
    }

    private static getCommandTogglePreview(): string {
        if (TextUtil.versionCompare(version, "1.3.0") < 0) {
            return MarkDownUtil.COMMAND_TOGGLE_PREVIEW
        }
        return MarkDownUtil.COMMAND_TOGGLE_PREVIEW_1_3_0;
    }
    private static getCommandOpenPreviewSideBySide(): string {
        if (TextUtil.versionCompare(version, "1.3.0") < 0) {
            return MarkDownUtil.COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE
        }
        return MarkDownUtil.COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE_1_3_0;
    }
}