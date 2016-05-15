"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as path from "path";
let fileUrl = require("file-url");


export enum SourceType {
    BODY,           // 定义文档的主体
    BR,             // 在文档中插入换行符
    COMMENT,        // 在源代码中插入注释
    DIVISION,       // 定义文档中的分区或节（division/section）
    DOCTYPE,        // 指示 web 浏览器关于页面使用哪个 HTML 版本进行编写的指令
    HR,             // 在 HTML 页面中创建一条水平线
    IMAGE,          // 向网页中嵌入一幅图像
    LINK,           // 定义文档与外部资源的链接关系，最常见的用途是链接样式表CSS
    SCRIPT,         // 定义客户端脚本
    STYLE,          // 为 HTML 文档定义样式信息
    STYLE_SAMPLE
}

export class HtmlUtil {
    private static COMMAND: string = "vscode.previewHtml";

    // @Override
    public static sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        return commands.executeCommand(this.COMMAND, previewUri, displayColumn).then((success) => {
        }, (reason) => {
            console.warn(reason);
            window.showErrorMessage(reason);
        });
    }


    public static errorSnippet(error: string): string {
        return this.createRemoteSource(SourceType.BODY,
            this.createRemoteSource(SourceType.DIVISION,
                error));
    }

    // 生成本地文件对应URI的html标签代码片段
    public static createRemoteSource(type: SourceType, content: string) {
        switch (type) {
            case SourceType.COMMENT:
                return `<!-- ${content} -->`;
            case SourceType.BODY:
                return `<body>
                            ${content}
                        </body>`;
            case SourceType.BR:
                return `<br>`;
            case SourceType.IMAGE:
                return `<img src="${content}"/>`;
            case SourceType.LINK:
                return `<link href="${content}" rel="stylesheet" />`;
            case SourceType.DIVISION:
                return `<div>${content}</div>`;
            case SourceType.DOCTYPE:
                return `<!DOCTYPE html>`;
            case SourceType.HR:
                return `<hr>`;
            case SourceType.SCRIPT:
                return `<script src="${content}"></script>`;
            case SourceType.STYLE:
                return `<style type=\"text/css\">
                            ${content}
                        </style>
                        `;
            case SourceType.STYLE_SAMPLE:
                return `<style type=\"text/css\">
                            #css_property {
                                ${content}
                            }
                        </style>
                        <body>
                            <div>Preview of the CSS properties</div>
                            <hr>
                            <div id=\"css_property\">Hello World</div>
                        </body>
                        `;
        }
    }
    // 生成本地文件对应URI的html标签代码片段
    public static createLocalSource(type: SourceType, fileName: string) {
        // __dirname 是package.json中"main"字段对应的绝对目录
        // 生成本地文件绝对路径URI
        let source_path = fileUrl(
            path.join(
                __dirname,
                "..",
                "..",
                "..",
                "static",
                fileName
            )
        );
        return this.createRemoteSource(type, source_path);
    }

    // 将html中将非http或\/开头的URI增加本地待预览html所在目录的前缀
    public static fixNoneNetLinks(document: string, documentPath: string): string {
        return document.replace(
            // 子表达式的序号问题
            // 简单地说：从左向右，以分组的左括号为标志，
            // 过程是要从左向右扫描两遍的：
            // 第一遍只给未命名组分配，
            // 第二遍只给命名组分配－－因此所有命名组的组号都大于未命名的组号。
            // 可以使用(?:exp)这样的语法来剥夺一个分组对组号分配的参与权．
            // http://www.cnblogs.com/dwlsxj/p/3532458.html
            new RegExp("((?:src|href)=[\'\"])((?!http|\\/).*?)([\'\"])", "gmi"), (subString: string, p1: string, p2: string, p3: string): string => {
                return [
                    p1.trim(),
                    fileUrl(path.join(
                        path.dirname(documentPath),
                        p2
                    )).trim(),
                    p3.trim()
                ].join("");
            }
        );
    }
    // 将html中将file://去掉,且恢复默认绝对路径
    public static fixImageSrcLinks(document: string): string {
        return document.replace(
            // 子表达式的序号问题
            // 简单地说：从左向右，以分组的左括号为标志，
            // 过程是要从左向右扫描两遍的：
            // 第一遍只给未命名组分配，
            // 第二遍只给命名组分配－－因此所有命名组的组号都大于未命名的组号。
            // 可以使用(?:exp)这样的语法来剥夺一个分组对组号分配的参与权．
            new RegExp("((?:src|href)=[\'\"])(?:file://)(.*?)([\'\"])", "gmi"), (subString: string, p1: string, p2: string, p3: string): string => {

                return [
                    p1.trim(),
                    path.resolve("/" + p2).trim(),
                    p3.trim()
                ].join("");
            }
        );
    }

}
