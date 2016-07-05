"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as fs from "fs";
import * as path from "path";
import {DocumentContentManagerInterface} from "./documentContentManagerInterface";
import {HtmlUtil} from "./utils/htmlUtil";
import {MarkDownUtil} from "./utils/markDownUtil";

var _instance: MarkdownDocumentContentManager = null;
export function getInstance() {
    if (!_instance) {
        _instance = new MarkdownDocumentContentManager();
    }

    return _instance;
}
class MarkdownDocumentContentManager implements DocumentContentManagerInterface {

    // 生成当前编辑页面的可预览代码片段
    // @Override
    public createContentSnippet(): string {
        let editor = window.activeTextEditor;
        if (editor.document.languageId !== "markdown") {
            return HtmlUtil.errorSnippet(this.getErrorMessage());
        }
        return this.generatePreviewSnippet(editor);
    }

    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        let command: string = this.getPreviewCommandTag(displayColumn);
        return MarkDownUtil.sendPreviewCommand(previewUri, command);

    }
    
    private getErrorMessage(): string {
        return `Active editor doesn't show a MarkDown document - no properties to preview.`;
    }


    private getPreviewCommandTag(displayColumn: ViewColumn): string {
        let command: string = "";
        if (displayColumn == window.activeTextEditor.viewColumn) {
            return MarkDownUtil.getCommandTogglePreview();
        }
        return MarkDownUtil.getCommandOpenPreviewSideBySide();
    }

    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): string {
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        return HtmlUtil.fixNoneNetLinks(doc.getText(), doc.fileName);
    }

}
