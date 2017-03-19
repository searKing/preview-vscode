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
    Disposable
} from "vscode";
import * as fs from "fs";
import * as path from "path";
import {
    DocumentContentManagerInterface
} from "./documentContentManagerInterface";
import {
    HtmlUtil,
    SourceType
} from "./utils/htmlUtil";
let fileUrl = require("file-url");



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
    public createContentSnippet(): string | Promise < string > {
        let editor = window.activeTextEditor;
        if (!editor || !editor.document) {
            return HtmlUtil.errorSnippet(this.getWindowErrorMessage());
        }
        if (editor.document.languageId !== "html" && editor.document.languageId !== "jade") {
            return HtmlUtil.errorSnippet("Active editor doesn't show a HTML or Jade document - no properties to preview.");
        }

        let previewSnippet: string = this.generatePreviewSnippet(editor);
        if (!previewSnippet || previewSnippet.length <= 0) {
            return HtmlUtil.errorSnippet(this.getErrorMessage());
        }
        console.info("previewSnippet = " + previewSnippet);
        return previewSnippet;
    }


    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable < void > {
        return HtmlUtil.sendPreviewCommand(previewUri, displayColumn);

    }

    private getErrorMessage(): string {
        return `Active editor doesn't show a HTML document - no properties to preview.`;
    }

    private getWindowErrorMessage(): string {
        return `No Active editor - no properties to preview.`;
    }

    // 生成预览编辑页面
    // @Override
    private generatePreviewSnippet(editor: TextEditor): string {
        if (!editor || !editor.document) {
            return HtmlUtil.errorSnippet("No Active editor - no properties to preview.");
        }
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        return HtmlUtil.createLocalSource(SourceType.STYLE, "header_fix.css") +
            HtmlUtil.createRemoteSource(SourceType.BR) +
            HtmlUtil.fixNoneNetLinks(doc.getText(), doc.fileName);
    }

}