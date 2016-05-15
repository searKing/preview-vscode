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
    HEAD,           // 定义文档的头部，它是所有头部元素的容器可以引用脚本、指示浏览器在哪里找到样式表、提供元信息等等。
    HR,             // 在 HTML 页面中创建一条水平线
    HTML,           // 告知浏览器其自身是一个 HTML 文档,限定了文档的开始点和结束点，在它们之间是文档的头部和主体
    IMAGE,          // 向网页中嵌入一幅图像
    LINK,           // 定义文档与外部资源的链接关系，最常见的用途是链接样式表CSS
    SCRIPT,         // 定义客户端脚本
    STYLE,          // 为 HTML 文档定义样式信息
    STYLE_SAMPLE,
    CUSTOM_NEWLINE  // 返回\n
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

    public static createFullHtmlSnippetFrom(headPayLoad: string, bodyPayLoad: string): string {

        return this.createRemoteSource(
            SourceType.DOCTYPE,
            this.createRemoteSource(
                SourceType.HTML,
                this.createRemoteSource(
                    SourceType.HEAD,
                    headPayLoad
                )
                + this.createRemoteSource(
                    SourceType.CUSTOM_NEWLINE,
                    undefined
                )
                + this.createRemoteSource(
                    SourceType.BODY,
                    bodyPayLoad)));
    }

    public static errorSnippet(error: string): string {
        return this.createFullHtmlSnippetFrom(undefined, this.createRemoteSource(SourceType.DIVISION, error));
    }
    private static isWithPayLoad(payLoad: string): boolean {
        if (!!payLoad && payLoad.length > 0) {
            return true;
        }
        return false;
    }
    // 生成本地文件对应URI的html标签代码片段
    public static createRemoteSourceAtNewline(type: SourceType, payLoad: string): string {
        return HtmlUtil.createRemoteSource(
            SourceType.CUSTOM_NEWLINE,
            HtmlUtil.createRemoteSource(type, payLoad));
    }
    // 生成本地文件对应URI的html标签代码片段
    public static createRemoteSource(type: SourceType, payLoad: string): string {
        switch (type) {
            case SourceType.BODY:
                return this.createRemoteSourceOfBODY(payLoad);
            case SourceType.BR:
                return this.createRemoteSourceOfBR(payLoad);
            case SourceType.COMMENT:
                return this.createRemoteSourceOfCOMMENT(payLoad);
            case SourceType.CUSTOM_NEWLINE:
                return this.createRemoteSourceOfCUSTOM_NEWLINE(payLoad);
            case SourceType.DIVISION:
                return this.createRemoteSourceOfDIVISION(payLoad);
            case SourceType.DOCTYPE:
                return this.createRemoteSourceOfDOCTYPE(payLoad);
            case SourceType.HEAD:
                return this.createRemoteSourceOfHEAD(payLoad);
            case SourceType.HR:
                return this.createRemoteSourceOfHR(payLoad);
            case SourceType.HTML:
                return this.createRemoteSourceOfHTML(payLoad);
            case SourceType.IMAGE:
                return this.createRemoteSourceOfIMAGE(payLoad);
            case SourceType.LINK:
                return this.createRemoteSourceOfLINK(payLoad);
            case SourceType.SCRIPT:
                return this.createRemoteSourceOfSCRIPT(payLoad);
            case SourceType.STYLE:
                return this.createRemoteSourceOfSTYLE(payLoad);
            case SourceType.STYLE_SAMPLE:
                return this.createRemoteSourceOfSTYLE_SAMPLE(payLoad);
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
        if (!document) {
            return document;
        }
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

    private static createRemoteSourceOfBODY(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<body>
                    ${payLoad}
                </body>`;
    }
    private static createRemoteSourceOfBR(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return `<br>`;
        }
        return `<br>
                ${payLoad}`;
    }
    private static createRemoteSourceOfCOMMENT(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<!-- ${payLoad} -->`;
    }
    private static createRemoteSourceOfCUSTOM_NEWLINE(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return `\n`;
        }
        return `\n${payLoad}`;
    }
    private static createRemoteSourceOfDIVISION(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<div>${payLoad}</div>`;
    }
    private static createRemoteSourceOfDOCTYPE(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return `<!DOCTYPE html>`;
        }
        return `<!DOCTYPE html>
                ${payLoad}`;
    }
    private static createRemoteSourceOfHEAD(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<head>
                    ${payLoad}
                </head>`;
    }
    private static createRemoteSourceOfHR(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return `<hr>`;
        }
        return `<hr>
                ${payLoad}`;
    }
    private static createRemoteSourceOfHTML(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<html>
                    ${payLoad}
                </html>`;
    }
    private static createRemoteSourceOfIMAGE(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<img src="${payLoad}"/>`;
    }
    private static createRemoteSourceOfLINK(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<link href="${payLoad}" rel="stylesheet" />`;
    }
    private static createRemoteSourceOfSCRIPT(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<script src="${payLoad}"></script>`;
    }
    private static createRemoteSourceOfSTYLE(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<style type=\"text/css\">
                    ${payLoad}
                </style>`;
    }
    private static createRemoteSourceOfSTYLE_SAMPLE(payLoad: string): string {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<style type=\"text/css\">
                    #css_property {
                        ${payLoad}
                    }
                </style>
                <body>
                    <div>Preview of the CSS properties</div>
                    <hr>
                    <div id=\"css_property\">Hello World</div>
                </body>`;
    }
}
