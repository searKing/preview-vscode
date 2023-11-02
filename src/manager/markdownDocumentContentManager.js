import { HtmlPreview } from "../util/htmlPreview";
// import { MarkdownPreview } from "../util/markdownPreview";
import { Markdown2HtmlLess } from "markdown2html-less";
const markdown2htmlLess = new Markdown2HtmlLess();
export class MarkdownDocumentContentManager {
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
        if (!editor || !editor.document) {
            return HtmlPreview.errorSnippet(this.getWindowErrorMessage());
        }
        if (this._editor.document.languageId !== "markdown") {
            return HtmlPreview.errorSnippet(this.getErrorMessage());
        }
        let previewSnippet = await this.generatePreviewSnippet(editor);
        if (!previewSnippet || previewSnippet.length <= 0) {
            return HtmlPreview.errorSnippet(this.getErrorMessage());
        }
        console.info("previewSnippet = " + previewSnippet);
        return previewSnippet;
    }
    // @Override
    sendPreviewCommand(previewUri, displayColumn) {
        // return MarkdownPreview.sendPreviewCommand(previewUri, displayColumn);
        return HtmlPreview.sendPreviewCommand(previewUri, displayColumn);
    }
    getErrorMessage() {
        return `Active editor doesn't show a MarkDown document - no properties to preview.`;
    }
    getWindowErrorMessage() {
        return `No Active editor - no properties to preview.`;
    }
    // 生成预览编辑页面
    generatePreviewSnippet(editor) {
        return (async () => {
            if (!editor || !editor.document) {
                return HtmlPreview.errorSnippet(this.getWindowErrorMessage());
            }
            // 获取当前编辑页面对应的文档
            let doc = editor.document;
            // let html = editormd.markdownToHTML(doc.getText());
            let html = await this.getHTML(doc.getText());
            return HtmlPreview.fixNoneNetLinks(html, doc.fileName);
        })();
    }
    getHTML(md) {
        const html = markdown2htmlLess.markdown2html(md);
        html.head = html.head || '';
        html.body = html.body || '';
        return Promise.resolve(HtmlPreview.createFullHtmlSnippetFrom(`${html.head}`, `${html.body}`));
    }
}
//# sourceMappingURL=markdownDocumentContentManager.js.map