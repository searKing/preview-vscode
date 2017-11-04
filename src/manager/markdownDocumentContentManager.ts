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
import { HtmlUtil } from "./../utils/htmlUtil";
import { MarkDownUtil } from "./../utils/markDownUtil";

let Markdown2HtmlLess = require("markdown2html-less").Markdown2HtmlLess;
const markdown2htmlLess = new Markdown2HtmlLess();

export class MarkdownDocumentContentManager implements DocumentContentManagerInterface {
    private _editor: TextEditor;

    public constructor(editor: TextEditor) {
        this._editor = editor;
        return this;
    }

    // @Override
    public editor(): TextEditor {
        return this._editor;
    }

    // 生成当前编辑页面的可预览代码片段
    // @Override
    public async createContentSnippet(): Promise<string> {
        let editor = this._editor;

        if (!editor || !editor.document) {
            return HtmlUtil.errorSnippet(this.getWindowErrorMessage());
        }
        if (this._editor.document.languageId !== "markdown") {
            return HtmlUtil.errorSnippet(this.getErrorMessage());
        }

        let previewSnippet: string = await this.generatePreviewSnippet(editor);
        if (!previewSnippet || previewSnippet.length <= 0) {
            return HtmlUtil.errorSnippet(this.getErrorMessage());
        }
        console.info("previewSnippet = " + previewSnippet);
        return previewSnippet;
    }

    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        // return MarkDownUtil.sendPreviewCommand(previewUri, displayColumn);
        return HtmlUtil.sendPreviewCommand(previewUri, displayColumn);

    }

    private getErrorMessage(): string {
        return `Active editor doesn't show a MarkDown document - no properties to preview.`;
    }

    private getWindowErrorMessage(): string {
        return `No Active editor - no properties to preview.`;
    }

    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): Promise<string> {
        return (async (): Promise<string> => {

            if (!editor || !editor.document) {
                return HtmlUtil.errorSnippet(this.getWindowErrorMessage());
            }
            // 获取当前编辑页面对应的文档
            let doc = editor.document;
            // let html = editormd.markdownToHTML(doc.getText());
            let html = await this.getHTML(doc.getText());
            return HtmlUtil.fixNoneNetLinks(html, doc.fileName);
        })();
    }

    private getHTML(md: string): Promise<string> {
        const html = markdown2htmlLess.markdown2html(md);
        html.head = html.head || '';
        html.body = html.body || '';
        return Promise.resolve(`${html.head}
${html.body}`);

    }
}
