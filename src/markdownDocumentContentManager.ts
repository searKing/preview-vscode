"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as documentContentManagerInterface from "./documentContentManagerInterface";
let fileUrl = require("file-url");


enum PreviewWindowType {
    OVERRIDE,
    SIDE_BY_SIDE
}
export class MarkdownDocumentContentManager  implements documentContentManagerInterface.DocumentContentManager{
    
    
    private COMMAND_TOGGLE_PREVIEW : string = "workbench.action.markdown.togglePreview";    
    private COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE : string = "workbench.action.markdown.openPreviewSideBySide";   
    private COMMAND_BUTT : string = "";
    // 生成当前编辑页面的可预览代码片段
    // @Override
    public createContentSnippet(): string {
        let editor = window.activeTextEditor;
        if (editor.document.languageId === "markdown") {
            return this.errorSnippet("Active editor doesn't show a MarkDown document - no properties to preview.");
        }
        return this.generatePreviewSnippet(editor);
    }
    
    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn):Thenable<void> {
        let command:string = this.getPreviewCommandTag(displayColumn);
        if (command != this.COMMAND_BUTT) {            
            return commands.executeCommand(command).then((success) => {
            }, (reason) => {
                console.warn(reason);
                window.showErrorMessage(reason);
            });
        }
    
    }

    
    private getPreviewCommandTag(displayColumn: ViewColumn):string{
        let command:string = "";
        if (displayColumn == window.activeTextEditor.viewColumn) {
            return this.COMMAND_TOGGLE_PREVIEW
        }
        return this.COMMAND_OPEN_PREVIEW_SIDE_BY_SIDE;
    }
    
    // 获得错误信息对应的html代码片段
    private errorSnippet(error: string): string {
        return `
                #${error}
                `;
    }

    // 将html中将非http或\/开头的URI增加本地待预览html所在目录的前缀
    private fixLinks(document: string, documentPath: string): string {
        return document.replace(
            // 子表达式的序号问题
            // 简单地说：从左向右，以分组的左括号为标志，
            // 过程是要从左向右扫描两遍的：
            // 第一遍只给未命名组分配，
            // 第二遍只给命名组分配－－因此所有命名组的组号都大于未命名的组号。
            // 可以使用(?:exp)这样的语法来剥夺一个分组对组号分配的参与权．
            new RegExp("((?:src|href)=[\'\"])((?!http|\\/).*?)([\'\"])", "gmi"), (subString: string, p1: string, p2: string, p3: string): string => {
                return [
                    p1,
                    fileUrl(path.join(
                        path.dirname(documentPath),
                        p2
                    )),
                    p3
                ].join("");
            }
        );
    }
    
    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): string {
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        return this.fixLinks(doc.getText(), doc.fileName);
    }
    
}
