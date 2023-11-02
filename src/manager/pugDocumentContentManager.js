import * as pug from "pug";
import { HtmlPreview } from "../util/htmlPreview";
export class PugDocumentContentManager {
    constructor(editor) {
        this._editor = editor;
        return this;
    }
    // @Override
    editor() {
        return this._editor;
    }
    // 生成当前编辑页面的可预览代码片段
    // @Override
    async createContentSnippet() {
        let editor = this._editor;
        if (!editor) {
            return HtmlPreview.errorSnippet(this.getWindowErrorMessage());
        }
        return this.generatePreviewSnippet(editor);
    }
    // @Override
    sendPreviewCommand(previewUri, displayColumn) {
        return HtmlPreview.sendPreviewCommand(previewUri, displayColumn);
    }
    // private getErrorMessage(): string {
    //     return `Active editor doesn't show a Pug Text document (.pug)- no properties to preview.`;
    // }
    getWindowErrorMessage() {
        return `No Active editor - no properties to preview.`;
    }
    pugSrcSnippetWithNodeModules(pugContent) {
        // compile
        var options = {
            pretty: true
        };
        var fn = pug.compile(pugContent, options);
        var html = fn();
        return html;
    }
    pugSrcSnippet(editor) {
        if (!editor) {
            return Promise.resolve(HtmlPreview.errorSnippet(this.getWindowErrorMessage()));
        }
        return Promise.resolve(this.pugSrcSnippetWithNodeModules(editor.document.getText()));
    }
    // 生成预览编辑页面
    generatePreviewSnippet(editor) {
        if (!editor || !editor.document) {
            return Promise.resolve(HtmlPreview.errorSnippet(this.getWindowErrorMessage()));
        }
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        return this.pugSrcSnippet(editor).then(function (pugSrc) {
            return HtmlPreview.fixNoneNetLinks(pugSrc, doc.fileName);
        });
    }
}
//# sourceMappingURL=pugDocumentContentManager.js.map