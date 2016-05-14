"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as fs from "fs";
import * as path from "path";
import {DocumentContentManagerInterface} from "./documentContentManagerInterface";
import {HtmlUtil} from "./utils/htmlUtil";
let fileUrl = require("file-url");


enum SourceType {
    SCRIPT,
    STYLE
}

var _instance: HtmlDocumentContentManager = null;
export function getInstance() {
    if (!_instance) {
        _instance = new HtmlDocumentContentManager();
    }

    return _instance;
}
class HtmlDocumentContentManager implements DocumentContentManagerInterface {
    // 生成当前编辑页面的HTML代码片段
    // @Override
    public createContentSnippet(): string {
        let editor = window.activeTextEditor;
        if (editor.document.languageId !== "html" && editor.document.languageId !== "jade") {
            return HtmlUtil.errorSnippet("Active editor doesn't show a HTML or Jade document - no properties to preview.");
        }
        return this.generatePreviewSnippet(editor);
    }


    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        return HtmlUtil.sendPreviewCommand(previewUri, displayColumn);

    }

    // 生成预览编辑页面
    // @Override
    private generatePreviewSnippet(editor: TextEditor): string {
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        return HtmlUtil.createLocalSource("header_fix.css", SourceType.STYLE) + HtmlUtil.fixNoneNetLinks(doc.getText(), doc.fileName);
    }


}
