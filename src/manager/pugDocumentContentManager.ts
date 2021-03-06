import { TextEditor, Uri, ViewColumn } from "vscode";
import * as pug from "pug";

import { DocumentContentManagerInterface } from "./documentContentManagerInterface";
import { HtmlPreview } from "../util/htmlPreview";



export class PugDocumentContentManager implements DocumentContentManagerInterface {

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

        if (!editor) {
            return HtmlPreview.errorSnippet(this.getWindowErrorMessage());
        }
        return this.generatePreviewSnippet(editor);
    }

    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        return HtmlPreview.sendPreviewCommand(previewUri, displayColumn);

    }

    // private getErrorMessage(): string {
    //     return `Active editor doesn't show a Pug Text document (.pug)- no properties to preview.`;
    // }

    private getWindowErrorMessage(): string {
        return `No Active editor - no properties to preview.`;
    }

    private pugSrcSnippetWithNodeModules(pugContent: string): string {
        // compile
        var options = {
            pretty: true
        }
        var fn = pug.compile(pugContent, options);
        var html = fn();

        return html;
    }
    private pugSrcSnippet(editor: TextEditor): Promise<string> {
        if (!editor) {
            return Promise.resolve(HtmlPreview.errorSnippet(this.getWindowErrorMessage()));
        }
        return Promise.resolve(this.pugSrcSnippetWithNodeModules(editor.document.getText()));

    }

    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): Promise<string> {
        if (!editor || !editor.document) {
            return Promise.resolve(HtmlPreview.errorSnippet(this.getWindowErrorMessage()));
        }
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        return this.pugSrcSnippet(editor).then(function (pugSrc: string) {
            return HtmlPreview.fixNoneNetLinks(pugSrc, doc.fileName);
        });
    }

}
