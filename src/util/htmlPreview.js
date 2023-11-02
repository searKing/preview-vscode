import { commands, Uri, version, window, workspace } from "vscode";
import * as path from "path";
import { TextEditorHelper } from "./textEditorHelper";
import { PreviewDocumentContentProvider } from "../previewDocumentContentProvider";
export var SourceType;
(function (SourceType) {
    SourceType[SourceType["BODY"] = 0] = "BODY";
    SourceType[SourceType["BR"] = 1] = "BR";
    SourceType[SourceType["COMMENT"] = 2] = "COMMENT";
    SourceType[SourceType["DIVISION"] = 3] = "DIVISION";
    SourceType[SourceType["DOCTYPE"] = 4] = "DOCTYPE";
    SourceType[SourceType["HEAD"] = 5] = "HEAD";
    SourceType[SourceType["HR"] = 6] = "HR";
    SourceType[SourceType["HTML"] = 7] = "HTML";
    SourceType[SourceType["IMAGE"] = 8] = "IMAGE";
    SourceType[SourceType["LINK"] = 9] = "LINK";
    SourceType[SourceType["SCRIPT"] = 10] = "SCRIPT";
    SourceType[SourceType["STYLE"] = 11] = "STYLE";
    SourceType[SourceType["CUSTOM_MERMAID_SAMPLE"] = 12] = "CUSTOM_MERMAID_SAMPLE";
    SourceType[SourceType["CUSTOM_STYLE_SAMPLE"] = 13] = "CUSTOM_STYLE_SAMPLE";
    SourceType[SourceType["CUSTOM_NEWLINE"] = 14] = "CUSTOM_NEWLINE"; // 返回\n
})(SourceType || (SourceType = {}));
export class HtmlPreview {
    // @Override
    static sendPreviewCommand(previewUri, displayColumn) {
        if (TextEditorHelper.versionCompare(version, "1.23.0") < 0) {
            return HtmlPreview.sendPreviewCommand_1_23_0_BELOW(previewUri, displayColumn);
        }
        return HtmlPreview.sendPreviewCommand_1_23_0(previewUri, displayColumn);
    }
    static sendPreviewCommand_1_23_0_BELOW(previewUri, displayColumn) {
        return commands.executeCommand(this.COMMAND_TOGGLE_PREVIEW, previewUri, displayColumn).then(() => {
            return;
        }, (reason) => {
            console.warn(reason);
            window.showErrorMessage(reason);
        });
    }
    static sendPreviewCommand_1_23_0(previewUri, displayColumn) {
        if (!window['createWebviewPanel']) {
            return Promise.resolve();
        }
        return workspace.openTextDocument(previewUri).then((doc) => {
            // Create and show a new webview
            const panel = window['createWebviewPanel'](previewUri.toString(), // Identifies the type of the webview. Used internally
            PreviewDocumentContentProvider.getPreviewTitle(doc.fileName), // Title of the panel displayed to the user
            displayColumn, // Editor column to show the new webview panel in.
            {
                // Enable scripts in the webview
                enableScripts: true
            } // Webview options. More on these later.
            );
            // And set its HTML content
            panel.webview.html = doc.getText();
        }, (reason) => {
            console.warn(reason);
            window.showErrorMessage(reason);
        });
    }
    static createFullHtmlSnippetFrom(headPayLoad, bodyPayLoad) {
        return this.createRemoteSource(SourceType.DOCTYPE, this.createRemoteSource(SourceType.HTML, this.createRemoteSource(SourceType.HEAD, headPayLoad)
            + this.createRemoteSource(SourceType.CUSTOM_NEWLINE, undefined)
            + this.createRemoteSource(SourceType.BODY, bodyPayLoad)));
    }
    static errorSnippet(error) {
        return this.createFullHtmlSnippetFrom(undefined, this.createRemoteSource(SourceType.DIVISION, error));
    }
    static isWithPayLoad(payLoad) {
        if (!!payLoad && payLoad.length > 0) {
            return true;
        }
        return false;
    }
    // 生成本地文件对应URI的html标签代码片段
    static createRemoteSourceAtNewline(type, payLoad) {
        return HtmlPreview.createRemoteSource(SourceType.CUSTOM_NEWLINE, HtmlPreview.createRemoteSource(type, payLoad));
    }
    // 生成本地文件对应URI的html标签代码片段
    static createRemoteSource(type, payLoad) {
        if (!payLoad) {
            return "";
        }
        switch (type) {
            case SourceType.BODY:
                return this.createRemoteSourceOfBODY(payLoad);
            case SourceType.BR:
                return this.createRemoteSourceOfBR(payLoad);
            case SourceType.COMMENT:
                return this.createRemoteSourceOfCOMMENT(payLoad);
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
            case SourceType.CUSTOM_NEWLINE:
                return this.createRemoteSourceOfCUSTOM_NEWLINE(payLoad);
            case SourceType.CUSTOM_MERMAID_SAMPLE:
                return this.createRemoteSourceOfCUSTOM_MERMAID_SAMPLE(payLoad);
            case SourceType.CUSTOM_STYLE_SAMPLE:
                return this.createRemoteSourceOfCUSTOM_STYLE_SAMPLE(payLoad);
        }
    }
    // 生成本地文件对应URI的html标签代码片段
    static createLocalSource(type, fileName) {
        // __dirname 是package.json中"main"字段对应的绝对目录
        // 生成本地文件绝对路径URI
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fileUrl = require('file-url');
        const source_path = fileUrl(path.join(__dirname, "..", "..", "..", "static", fileName));
        return this.createRemoteSource(type, source_path);
    }
    // 将html中将相对路径或file://或绝对路径开头的URI格式化问webview路径
    static fixNoneNetLinks(document, _documentPath) {
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
        // http://www.cnblogs.com/dwlsxj/p/3532458.html
        new RegExp("((?:src|href)=['\"])(.*?)(['\"])", "gmi"), (_subString, p1, p2, p3) => {
            p2 = HtmlPreview.getExtensionPath(p2);
            return [
                p1.trim(),
                p2.trim(),
                p3.trim()
            ].join("");
        });
    }
    // 将html中将file://去掉,且恢复默认绝对路径
    static fixImageSrcLinks(imageSnippet) {
        return HtmlPreview.fixNoneNetLinks(imageSnippet, "");
    }
    static async fixImageRedirectUrl(srcUrl) {
        if (!srcUrl) {
            return "";
        }
        const result = HtmlPreview.HTTP_S_REGREX_PREFFIX.exec(srcUrl);
        if (result == null) {
            return "";
        }
        try {
            return await HtmlPreview.getRedirectUrl(srcUrl);
        }
        catch (error) {
            return srcUrl;
        }
    }
    static getRedirectUrl(firstUrl) {
        return new Promise(function (_resolve, _reject) {
            // Pass final redirect url to callback
            // https://github.com/request/request/pull/220#issuecomment-5012579
            const options = {
                method: 'GET',
                url: firstUrl,
                // followAllRedirects: false,
                // maxRedirects: 1,
                headers: {
                    'cache-control': 'no-cache'
                }
            };
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const request = require("request");
            request.get(options, (err, resp, _body) => {
                if (err) {
                    return;
                }
                firstUrl = resp.request.uri.href;
            });
            return firstUrl;
        });
    }
    static createRemoteSourceOfBODY(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<body>
                    ${payLoad}
                </body>`;
    }
    static createRemoteSourceOfBR(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return `<br>`;
        }
        return `<br>
                ${payLoad}`;
    }
    static createRemoteSourceOfCOMMENT(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<!-- ${payLoad} -->`;
    }
    static createRemoteSourceOfDIVISION(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<div>${payLoad}</div>`;
    }
    static createRemoteSourceOfDOCTYPE(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return `<!DOCTYPE html>`;
        }
        return `<!DOCTYPE html>
                ${payLoad}`;
    }
    static createRemoteSourceOfHEAD(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<head>
                    ${payLoad}
                </head>`;
    }
    static createRemoteSourceOfHR(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return `<hr>`;
        }
        return `<hr>
                ${payLoad}`;
    }
    static createRemoteSourceOfHTML(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<html>
                    ${payLoad}
                </html>`;
    }
    static createRemoteSourceOfIMAGE(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<img src="${payLoad}"/>`;
    }
    static createRemoteSourceOfLINK(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<link href="${payLoad}" rel="stylesheet" />`;
    }
    static createRemoteSourceOfSCRIPT(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<script src="${payLoad}"></script>`;
    }
    static createRemoteSourceOfSTYLE(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        return `<style type="text/css">
                    ${payLoad}
                </style>`;
    }
    static createRemoteSourceOfCUSTOM_NEWLINE(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return `\n`;
        }
        return `\n${payLoad}`;
    }
    static createRemoteSourceOfCUSTOM_MERMAID_SAMPLE(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        const head = `<script src="${this.getExtensionPath()}/node_modules/mermaid/dist/mermaid.min.js" type="text/javascript">
                        mermaid.initialize({startOnLoad: true, theme: 'forest'});
                    </script>`;
        const body = `
                    <hr>
                    <div class="mermaid">
                        ${payLoad}
                    </div>`;
        return HtmlPreview.createFullHtmlSnippetFrom(head, body);
    }
    static getExtensionPath(...paths) {
        if (TextEditorHelper.versionCompare(version, "1.23.0") < 0) {
            return HtmlPreview.getExtensionPath_1_23_0_BELOW(...paths);
        }
        return HtmlPreview.getExtensionPath_1_23_0(...paths);
    }
    // 相对路径，则补全为相对插件的路径
    static getExtensionPath_1_23_0_BELOW(...paths) {
        if (!!paths && paths.length > 0) {
            let p0 = paths[0];
            const p = Uri.parse(p0);
            if (p.scheme != "file" || p0.startsWith("/")) {
                return paths.join("/");
            }
            const fs = p0.replace(/^file:\/\//, "");
            if (fs.startsWith("/")) {
                return paths.join("/");
            }
            // file://./a/b/c
            // file://a/b/c
            if (p0.startsWith("file://")) {
                paths[0] = "file://" + path.normalize(path.join(__dirname, "..", "..", fs));
                return paths.join("/");
            }
        }
        return path.normalize(path.join(__dirname, "..", "..", ...paths));
    }
    static getExtensionPath_1_23_0(...paths) {
        const onDiskPath_1_23_0_BELOW = HtmlPreview.getExtensionPath_1_23_0_BELOW(...paths);
        const onDiskPath = Uri.parse(onDiskPath_1_23_0_BELOW);
        // And get the special URI to use with the webview
        if (!onDiskPath['with']) {
            return onDiskPath_1_23_0_BELOW;
        }
        if (onDiskPath.scheme !== "file") {
            return onDiskPath_1_23_0_BELOW;
        }
        return onDiskPath.with({ scheme: 'vscode-resource' }).toString();
    }
    static createRemoteSourceOfCUSTOM_STYLE_SAMPLE(payLoad) {
        if (!this.isWithPayLoad(payLoad)) {
            return ``;
        }
        const head = HtmlPreview.createRemoteSource(SourceType.STYLE, `#css_property {
                ${payLoad}
            }`);
        const body = `<div>Preview of the CSS properties
                        {
                            ${payLoad}
                        }
                    </div>
                    <hr>
                    <div id="css_property">Hello World</div>`;
        return HtmlPreview.createFullHtmlSnippetFrom(head, body);
    }
}
HtmlPreview.COMMAND_TOGGLE_PREVIEW = "vscode.previewHtml";
HtmlPreview.HTTP_S_REGREX_PREFFIX = /http[s]{0,1}:\/\//;
//# sourceMappingURL=htmlPreview.js.map