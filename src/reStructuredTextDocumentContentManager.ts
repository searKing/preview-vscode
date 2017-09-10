"use strict";
import {
    workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable
} from "vscode";
import { DocumentContentManagerInterface } from "./documentContentManagerInterface";
import { HtmlUtil, SourceType } from "./utils/htmlUtil";
import { TextUtil, TextUtilReturnType } from "./utils/textUtil"
import { DocutilsUtil } from "./utils/docutilsUtil"

import * as path from "path";
let rst2mdown = require("rst2mdown");
let markdown = require("markdown").markdown;


export class ReStructuredTextDocumentContentManager implements DocumentContentManagerInterface {

    private _editor: TextEditor;

    public constructor(editor: TextEditor) {
        this._editor = editor;
        return this;
    }

    // 生成当前编辑页面的可预览代码片段
    // @Override
    public async createContentSnippet(): Promise<string> {
        let editor = this._editor;

        if (!editor) {
            return HtmlUtil.errorSnippet(this.getWindowErrorMessage());
        }
        if (editor.document.languageId !== "rst") {
            return HtmlUtil.errorSnippet(this.getErrorMessage());
        }
        return this.generatePreviewSnippet(editor);
    }

    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        return HtmlUtil.sendPreviewCommand(previewUri, displayColumn);

    }

    private getErrorMessage(): string {
        return `Active editor doesn't show a ReStructured Text document (.rst|.rest|.hrst)- no properties to preview.`;
    }

    private getWindowErrorMessage(): string {
        return `No Active editor - no properties to preview.`;
    }

    private rstSrcSnippetWithNodeModules(rstContent: string): string {
        return markdown.toHTML(rst2mdown(rstContent));

    }
    private rstSrcSnippetWithDocutils(editor: TextEditor): Promise<string> {
        if (!editor || !editor.document) {
            return Promise.resolve(HtmlUtil.errorSnippet(this.getWindowErrorMessage()));
        }
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        return DocutilsUtil.rst2html(doc.fileName);
    }
    private rstSrcSnippet(editor: TextEditor): Promise<string> {
        if (!editor) {
            return Promise.resolve(HtmlUtil.errorSnippet(this.getWindowErrorMessage()));
        }
        let thiz = this;
        return this.rstSrcSnippetWithDocutils(editor).catch(function (error) {
            console.error("we got an error: " + error);
            window.showWarningMessage("try rst2html of doctutils failed, please check python and doctuils environment, we use a simple preview instead ^-)");
            if (!editor.document) {
                return Promise.resolve(HtmlUtil.errorSnippet(this.getWindowErrorMessage()));
            }
            return thiz.rstSrcSnippetWithNodeModules(editor.document.getText());
        });

    }

    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): Promise<string> {
        if (!editor || editor.document) {
            return Promise.resolve(HtmlUtil.errorSnippet(this.getWindowErrorMessage()));
        }
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        return this.rstSrcSnippet(editor).then(function (rstSrc: string) {
            return HtmlUtil.fixNoneNetLinks(rstSrc, doc.fileName);
        });
    }

}
