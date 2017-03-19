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
import {
    DocumentContentManagerInterface
} from "./documentContentManagerInterface";
import {
    HtmlUtil,
    SourceType
} from "./utils/htmlUtil";
import {
    MermaidUtil
} from "./utils/mermaidUtil";


var _instance: MermaidDocumentContentManager = null;
export function getInstance() {
    if (!_instance) {
        _instance = new MermaidDocumentContentManager();
    }

    return _instance;
}
class MermaidDocumentContentManager implements DocumentContentManagerInterface {


    private COMMAND: string = "vscode.previewHtml";
    // 生成当前编辑页面的可预览代码片段
    // @Override
    public createContentSnippet(): string | Promise<string> {
        let editor = window.activeTextEditor;

        if (!editor || !editor.document) {
            return HtmlUtil.errorSnippet(this.getWindowErrorMessage());
        }
        if (editor.document.languageId !== "mermaid") {
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