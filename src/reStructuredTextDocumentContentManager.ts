"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import {DocumentContentManagerInterface} from "./documentContentManagerInterface";
import {HtmlUtil, SourceType} from "./utils/htmlUtil";
import {TextUtil, TextUtilReturnType} from "./utils/textUtil"
import {DoctuilsUtil} from "./utils/doctuilsUtil"

import * as path from "path";
let rst2mdown = require("rst2mdown");
let markdown = require("markdown").markdown;

var _instance: ReStructuredTextDocumentContentManager = null;
export function getInstance() {
    if (!_instance) {
        _instance = new ReStructuredTextDocumentContentManager();
    }

    return _instance;
}

class ReStructuredTextDocumentContentManager implements DocumentContentManagerInterface {

    // 生成当前编辑页面的可预览代码片段
    // @Override
    public createContentSnippet(): string | Promise<string> {
        let editor = window.activeTextEditor;
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


    private rstSrcSnippetWithNodeModules(rstContent: string): string {
        return markdown.toHTML(rst2mdown(rstContent));

    }
    private rstSrcSnippetWithDoctuils(editor: TextEditor): Promise<string> {
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        return DoctuilsUtil.rst2html(doc.fileName);
    }
    private rstSrcSnippet(editor: TextEditor): Promise<string> {
        return this.rstSrcSnippetWithDoctuils(editor).catch(function (error) {
            console.error("we got an error: " + error);
            return markdown.toHTML(rst2mdown(editor.document.getText()));
        });

    }

    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): Promise<string> {
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        return this.rstSrcSnippet(editor).then(function (rstSrc: string) {
            return HtmlUtil.fixNoneNetLinks(rstSrc, doc.fileName);
        });
    }

}
