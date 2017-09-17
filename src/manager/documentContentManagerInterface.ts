"use strict";
import {
    workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable
} from "vscode";

export interface DocumentContentManagerInterface {

    // 生成当前编辑页面的HTML代码片段
    createContentSnippet(): Promise<string>;

    sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn, editor: TextEditor): Thenable<void>;

    editor() : TextEditor;
}
