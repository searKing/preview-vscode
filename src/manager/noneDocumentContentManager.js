import { window } from "vscode";
export class NoneDocumentContentManager {
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
        return this.getErrorMessage();
    }
    // @Override
    sendPreviewCommand(_previewUri, _displayColumn) {
        window.showWarningMessage(this.getErrorMessage());
        return Promise.resolve();
    }
    getErrorMessage() {
        return "Couldn't determine type to preview, please choose.";
    }
}
//# sourceMappingURL=noneDocumentContentManager.js.map