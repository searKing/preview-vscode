"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as path from "path";
let fileUrl = require("file-url");



export class MermaidUtil {
    private static COMMAND: string = "vscode.previewHtml";
    public static COMMAND_BUTT: string = "";

    // @Override
    public static sendPreviewCommand(previewUri: Uri, command: string): Thenable<void> {
        if (command != this.COMMAND_BUTT) {
            return commands.executeCommand(command).then((success) => {
            }, (reason) => {
                console.warn(reason);
                window.showErrorMessage(reason);
            });
        }

    }
    public static isMermaidFile(editor: TextEditor): boolean {
        if(!editor || !editor.document || !editor.document.fileName){
            return false;
        }
        if (editor.document.fileName.toLowerCase().endsWith(".mermaid")) {
            return true;
        }
        return false;
    }

}
