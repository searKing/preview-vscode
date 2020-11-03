"use strict";
import { TextEditor, Uri, ViewColumn } from "vscode";
import { DocumentContentManagerInterface } from "./documentContentManagerInterface";
import { HtmlUtil, SourceType } from "./../utils/htmlUtil";

export class MermaidDocumentContentManager implements DocumentContentManagerInterface {


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

        let previewSnippet: string = this.generatePreviewSnippet(editor);
        if (!previewSnippet || previewSnippet.length <= 0) {
            return HtmlUtil.errorSnippet(this.getErrorMessage());
        }
        console.info("previewSnippet = " + previewSnippet);
        return previewSnippet;
    }

    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        return HtmlUtil.sendPreviewCommand(previewUri, displayColumn);
    }

    private getErrorMessage(): string {
        return `Active editor doesn't show a Mermaid document - no properties to preview.`;
    }

    private getWindowErrorMessage(): string {
        return `No Active editor - no properties to preview.`;
    }

    private MermaidSampleFullSnippet(properties: string): string {
        return HtmlUtil.createRemoteSource(SourceType.CUSTOM_MERMAID_SAMPLE, properties);
    }

    private getSelectedCSSProperity(editor: TextEditor): string {
        if (!editor || !editor.document) {
            return HtmlUtil.errorSnippet(this.getWindowErrorMessage());
        }
        return editor.document.getText();
    }

    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): string {
        if (!editor) {
            return HtmlUtil.errorSnippet(this.getWindowErrorMessage());
        }
        var cssProperty = this.getSelectedCSSProperity(editor);
        if (!cssProperty || cssProperty.length <= 0) {
            return HtmlUtil.errorSnippet(this.getErrorMessage());
        }

        return this.MermaidSampleFullSnippet(cssProperty);
    }

}