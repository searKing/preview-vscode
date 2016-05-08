"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as fs from "fs";
import * as path from "path";
let fileUrl = require("file-url");


export class MarkdownDocumentContentManager {
    
    // 生成当前编辑页面的HTML代码片段
    public createContentSnippet(): string {
        let editor = window.activeTextEditor;
        if (editor.document.languageId !== "markdown") {
            return this.errorSnippet("Active editor doesn't show a HTML or Jade document - no properties to preview.");
        }
        return this.preview(editor);
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
    public preview(editor: TextEditor): string {
        // 获取当前编辑页面对应的文档
        let doc = editor.document;
        return this.fixLinks(doc.getText(), doc.fileName);
    }
}
