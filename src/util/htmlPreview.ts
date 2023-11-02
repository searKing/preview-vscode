import { commands, TextDocument, Uri, version, ViewColumn, window, workspace } from "vscode";
import * as path from "path";
import { TextEditorHelper } from "./textEditorHelper";

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
	CUSTOM_MERMAID_SAMPLE,
	CUSTOM_STYLE_SAMPLE,
	CUSTOM_NEWLINE  // 返回\n
}

export class HtmlPreview {
	private static COMMAND_TOGGLE_PREVIEW = "vscode.previewHtml";
	private static HTTP_S_REGREX_PREFFIX = /http[s]{0,1}:\/\//;

	// @Override
	public static sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
		if (TextEditorHelper.versionCompare(version, "1.23.0") < 0) {
			return HtmlPreview.sendPreviewCommand_1_23_0_BELOW(previewUri, displayColumn);
		}
		return HtmlPreview.sendPreviewCommand_1_23_0(previewUri, displayColumn);
	}

	public static sendPreviewCommand_1_23_0_BELOW(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
		return commands.executeCommand(this.COMMAND_TOGGLE_PREVIEW, previewUri, displayColumn).then(() => {
			return;
		}, (reason) => {
			console.warn(reason);
			window.showErrorMessage(reason);
		});
	}

	public static sendPreviewCommand_1_23_0(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
		if (!window['createWebviewPanel']) {
			return Promise.resolve();
		}
		return workspace.openTextDocument(previewUri).then((doc: TextDocument) => {
			// Create and show a new webview
			const panel = window['createWebviewPanel'](
				previewUri.toString(), // Identifies the type of the webview. Used internally
				path.basename(doc.fileName), // Title of the panel displayed to the user
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

	public static createFullHtmlSnippetFrom(headPayLoad?: string, bodyPayLoad?: string): string {

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

	private static isWithPayLoad(payLoad?: string): boolean {
		if (!!payLoad && payLoad.length > 0) {
			return true;
		}
		return false;
	}

	// 生成本地文件对应URI的html标签代码片段
	public static createRemoteSourceAtNewline(type: SourceType, payLoad?: string): string {
		return HtmlPreview.createRemoteSource(
			SourceType.CUSTOM_NEWLINE,
			HtmlPreview.createRemoteSource(type, payLoad));
	}

	// 生成本地文件对应URI的html标签代码片段
	public static createRemoteSource(type: SourceType, payLoad?: string): string {
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
	public static createLocalSource(type: SourceType, fileName: string) {
		// __dirname 是package.json中"main"字段对应的绝对目录
		// 生成本地文件绝对路径URI
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const fileUrl = require('file-url');
		const source_path = fileUrl(
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

	// 将html中将相对路径或file://或绝对路径开头的URI格式化问webview路径
	public static fixNoneNetLinks(document: string, _documentPath?: string): string {
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
			new RegExp("((?:src|href)=['\"])(.*?)(['\"])", "gmi"), (_subString: string, p1: string, p2: string, p3: string): string => {
				p2 = HtmlPreview.getExtensionPath(p2);
				return [
					p1.trim(),
					p2.trim(),
					p3.trim()
				].join("");
			}
		);
	}

	// 将html中将file://去掉,且恢复默认绝对路径
	public static fixImageSrcLinks(imageSnippet: string): string {
		return HtmlPreview.fixNoneNetLinks(imageSnippet, "");
	}

	public static async fixImageRedirectUrl(srcUrl: string): Promise<string> {
		if (!srcUrl) {
			return "";
		}
		const result: RegExpExecArray | null = HtmlPreview.HTTP_S_REGREX_PREFFIX.exec(srcUrl);
		if (result == null) {
			return "";
		}
		try {
			return await HtmlPreview.getRedirectUrl(srcUrl);
		} catch (error) {
			return srcUrl;
		}
	}

	private static getRedirectUrl(firstUrl: string): Promise<string> {

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
			request.get(options, (err: any, resp: any, _body: any) => {
				if (err) {
					return;
				}
				firstUrl = resp.request.uri.href;
			});
			return firstUrl;
		});

	}

	private static createRemoteSourceOfBODY(payLoad: string): string {
		if (!this.isWithPayLoad(payLoad)) {
			return ``;
		}
		return `<body>
                    ${payLoad}
                </body>`;
	}

	private static createRemoteSourceOfBR(payLoad?: string): string {
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

	private static createRemoteSourceOfDIVISION(payLoad: string): string {
		if (!this.isWithPayLoad(payLoad)) {
			return ``;
		}
		return `<div>${payLoad}</div>`;
	}

	private static createRemoteSourceOfDOCTYPE(payLoad?: string): string {
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

	private static createRemoteSourceOfHR(payLoad?: string): string {
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
		return `<style type="text/css">
                    ${payLoad}
                </style>`;
	}

	private static createRemoteSourceOfCUSTOM_NEWLINE(payLoad?: string): string {
		if (!this.isWithPayLoad(payLoad)) {
			return `\n`;
		}
		return `\n${payLoad}`;
	}

	private static createRemoteSourceOfCUSTOM_MERMAID_SAMPLE(payLoad: string): string {
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

	private static getExtensionPath(...paths: string[]): string {
		if (TextEditorHelper.versionCompare(version, "1.23.0") < 0) {
			return HtmlPreview.getExtensionPath_1_23_0_BELOW(...paths);
		}
		return HtmlPreview.getExtensionPath_1_23_0(...paths);
	}

	// 相对路径，则补全为相对插件的路径
	private static getExtensionPath_1_23_0_BELOW(...paths: string[]): string {
		if (!!paths && paths.length > 0) {
			let p0 = paths[0] as string;
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
				paths[0] = "file://" + path.normalize(path.join(
					__dirname,
					"..",
					"..",
					fs
				))
				return paths.join("/");
			}
		}
		return path.normalize(path.join(
			__dirname,
			"..",
			"..",
			...paths
		));
	}

	private static getExtensionPath_1_23_0(...paths: string[]): string {
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

	private static createRemoteSourceOfCUSTOM_STYLE_SAMPLE(payLoad: string): string {
		if (!this.isWithPayLoad(payLoad)) {
			return ``;
		}

		const head = HtmlPreview.createRemoteSource(SourceType.STYLE,
			`#css_property {
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
