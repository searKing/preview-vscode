import { TextEditor, Uri, ViewColumn } from "vscode";
import { DocumentContentManagerInterface } from "./documentContentManagerInterface";
import { HtmlPreview, SourceType } from "../util/htmlPreview";


export class CssDocumentContentManager implements DocumentContentManagerInterface {

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

        let previewSnippet: string = this.generatePreviewSnippet(editor);
        if (!previewSnippet || previewSnippet.length <= 0) {
            return HtmlPreview.errorSnippet(this.getErrorMessage());
        }
        console.info("previewSnippet = " + previewSnippet);
        return previewSnippet;
    }

    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn, _editor: TextEditor): Thenable<void> {
        return HtmlPreview.sendPreviewCommand(previewUri, displayColumn);
    }

    private getErrorMessage(): string {
        return `Active editor doesn't show a CSS document - no properties to preview.`;
    }

    private getWindowErrorMessage(): string {
        return `No Active editor - no properties to preview.`;
    }

    private CSSSampleFullSnippet(properties: string): string {
        return HtmlPreview.createRemoteSource(SourceType.CUSTOM_STYLE_SAMPLE, properties);

    }

    private getSelectedCSSProperity(editor: TextEditor): string {
        if (!editor || !editor.document) {
            return HtmlPreview.errorSnippet(this.getWindowErrorMessage());
        }
        // 获取当前页面文本
        let text = editor.document.getText();
        // 获取当前鼠标选中段落的起始位置        
        let startPosOfSelectionText = editor.document.offsetAt(editor.selection.anchor);
        let startPosOfCSSProperty = text.lastIndexOf('{', startPosOfSelectionText);
        let endPosOfCSSProperty = text.indexOf('}', startPosOfCSSProperty);

        if (startPosOfCSSProperty === -1 || endPosOfCSSProperty === -1) {
            return HtmlPreview.errorSnippet("Cannot determine the rule's properties.");
        }

        var properties = text.slice(startPosOfCSSProperty + 1, endPosOfCSSProperty);
        return properties;
    }

    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): string {
        if (!editor) {
            return HtmlPreview.errorSnippet(this.getWindowErrorMessage());
        }
        var cssProperty = this.getSelectedCSSProperity(editor);
        if (!cssProperty || cssProperty.length <= 0) {
            return HtmlPreview.errorSnippet(this.getErrorMessage());
        }

        return this.CSSSampleFullSnippet(cssProperty);
    }

}
