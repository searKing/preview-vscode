"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as fs from "fs";
import * as path from "path";
import {DocumentContentManagerInterface} from "./documentContentManagerInterface";

var _instance: NoneDocumentContentManager = null;
export function getInstance() {
    if (!_instance) {
        _instance = new NoneDocumentContentManager();
    }

    return _instance;
}
class NoneDocumentContentManager implements DocumentContentManagerInterface {

    // 生成当前编辑页面的可预览代码片段
    // @Override
    public createContentSnippet(): string | Promise<string>{
        return this.getErrorMessage();
    }

    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        window.showWarningMessage(this.getErrorMessage());
        return;
    }

    private getErrorMessage(): string {
        return "Couldn't determine type to preivew, please choose.";
    }


}
