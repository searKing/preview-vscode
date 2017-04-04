"use strict";
import {
    workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable
} from "vscode";
import * as fs from "fs";
import * as path from "path";
import { DocumentContentManagerInterface } from "./documentContentManagerInterface";
import { HtmlUtil } from "./utils/htmlUtil";
import { MarkDownUtil } from "./utils/markDownUtil";

var _instance: MarkdownDocumentContentManager = null;
export function getInstance() {
    if (!_instance) {
        _instance = new MarkdownDocumentContentManager();
    }

    return _instance;
}
class MarkdownDocumentContentManager implements DocumentContentManagerInterface {

    // 生成当前编辑页面的可预览代码片段
    // @Override
    public async createContentSnippet(): Promise<string> {
        let editor = window.activeTextEditor;
        if (!editor || !editor.document) {
            return HtmlUtil.errorSnippet(this.getWindowErrorMessage());
        }
        if (editor.document.languageId !== "markdown") {
            return HtmlUtil.errorSnippet(this.getErrorMessage());
        }

        let previewSnippet: string = this.generatePreviewSnippet(editor);
        if (!previewSnippet || previewSnippet.length <= 0) {
            return HtmlUtil.errorSnippet(this.getErrorMessage());
        }
        console.info("previewSnippet = " + previewSnippet);
        return previewSnippet;
    }

    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        return MarkDownUtil.sendPreviewCommand(previewUri, displayColumn);

    }

    private getErrorMessage(): string {
        return `Active editor doesn't show a MarkDown document - no properties to preview.`;
    }

    private getWindowErrorMessage(): string {
        return `No Active editor - no properties to preview.`;
    }

    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): string {
        if (!editor || !editor.document) {
            return HtmlUtil.errorSnippet(this.getWindowErrorMessage());
        }
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        return HtmlUtil.fixNoneNetLinks(doc.getText(), doc.fileName);
    }

}
