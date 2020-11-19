import { window, TextEditor, Uri, ViewColumn } from "vscode";
import { DocumentContentManagerInterface } from "./documentContentManagerInterface";

export class NoneDocumentContentManager implements DocumentContentManagerInterface {

    private _editor: TextEditor;//useless

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
        return this.getErrorMessage();
    }

    // @Override
    public sendPreviewCommand(_previewUri: Uri, _displayColumn: ViewColumn): Thenable<void> {
        window.showWarningMessage(this.getErrorMessage());
        return Promise.resolve();
    }

    private getErrorMessage(): string {
        return "Couldn't determine type to preview, please choose.";
    }


}
