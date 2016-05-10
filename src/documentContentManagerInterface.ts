"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as fs from "fs";
import * as path from "path";
let fileUrl = require("file-url");

export interface DocumentContentManager {

    // 生成当前编辑页面的HTML代码片段
    createContentSnippet(): string;

    sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void>;
}
