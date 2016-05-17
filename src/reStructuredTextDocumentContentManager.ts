"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import {DocumentContentManagerInterface} from "./documentContentManagerInterface";
import {HtmlUtil, SourceType} from "./utils/htmlUtil";
import {TextUtil, TextUtilReturnType} from "./utils/textUtil"
import {MarkDownUtil} from "./utils/markDownUtil";

import * as path from "path";
let rst2mdown = require("rst2mdown");

var _instance: ReStructuredTextDocumentContentManager = null;
export function getInstance() {
    if (!_instance) {
        _instance = new ReStructuredTextDocumentContentManager();
    }

    return _instance;
}

class ReStructuredTextDocumentContentManager implements DocumentContentManagerInterface {

    // 生成当前编辑页面的可预览代码片段
    // @Override
    public createContentSnippet(): string {
        let editor = window.activeTextEditor;
        if (editor.document.languageId !== "rst") {
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
        return `Active editor doesn't show a ReStructured Text document (.rst|.rest|.hrst)- no properties to preview.`;
    }


    private getPreviewCommandTag(displayColumn: ViewColumn): string {
        let command: string = "";
        if (displayColumn == window.activeTextEditor.viewColumn) {
            return MarkDownUtil.COMMAND_TOGGLE_PREVIEW
        }
        return MarkDownUtil.COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE;
    }

    private rstSrcSnippet(rstContent: string): string {
        return rst2mdown(rstContent);   

    }
    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): string {
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        let sa = HtmlUtil.fixNoneNetLinks(this.rstSrcSnippet(doc.getText()), doc.fileName);
        return HtmlUtil.fixNoneNetLinks(this.rstSrcSnippet(doc.getText()), doc.fileName);
    }

}
