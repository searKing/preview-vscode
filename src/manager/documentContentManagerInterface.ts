"use strict";
import { TextEditor, Uri, ViewColumn } from "vscode";

export interface DocumentContentManagerInterface {

    // 生成当前编辑页面的HTML代码片段
    createContentSnippet(): Promise<string>;

    sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn, editor: TextEditor): Thenable<void>;

    editor(): TextEditor;
}
