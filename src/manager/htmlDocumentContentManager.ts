import { TextEditor, Uri, ViewColumn } from "vscode";
import { DocumentContentManagerInterface } from "./documentContentManagerInterface";
import { HtmlPreview, SourceType } from "../util/htmlPreview";

export class HtmlDocumentContentManager implements DocumentContentManagerInterface {
    private _editor: TextEditor;

    public constructor(editor: TextEditor) {
        this._editor = editor;
        return this;
    }

    // @Override
    public editor(): TextEditor {
        return this._editor;
    }

    // 生成当前编辑页面的HTM L代码片段
    // @Override
    public async createContentSnippet(): Promise<string> {
        let editor = this._editor;

        if (!editor || !editor.document) {
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
        return `Active editor doesn't show a HTML document - no properties to preview.`;
    }

    private getWindowErrorMessage(): string {
        return `No Active editor - no properties to preview.`;
    }

    // 生成预览编辑页面
    // @Override
    private generatePreviewSnippet(editor: TextEditor): string {
        if (!editor || !editor.document) {
            return HtmlPreview.errorSnippet("No Active editor - no properties to preview.");
        }
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        return HtmlPreview.createLocalSource(SourceType.STYLE, "header_fix.css") +
            HtmlPreview.createRemoteSource(SourceType.BR) +
            HtmlPreview.fixNoneNetLinks(doc.getText(), doc.fileName);
    }

}