"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as htmlDocumentContentManager from "./htmlDocumentContentManager";
import * as markdownDocumentContentManager from "./markdownDocumentContentManager";
let fileUrl = require("file-url");
let previewScheme = "";
enum TextDocumentType {
    HTML,
    MARKDOWN
}
// 主函数
export function activate(context: ExtensionContext) {

    let previewUri: Uri;

    let provider: PreviewDocumentContentProvider;
    let registration: Disposable;
    const PREVIEW_SCHEME : string = "vscode-preview";
    
    // 向vscode注册当前文件发生变化时的回调函数
    workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
        if (e.document === window.activeTextEditor.document) {
            // 由于文档变动必然在插件启动之后，而插件启动时就已经创建了provider
            // 因此不存在该变量未定义的问题
            provider.update(previewUri);
        }
    });
    
 
    // 调用vscode系统命令预览当前HTML页面
    function sendPreviewCommand(displayColumn: ViewColumn): PromiseLike<void> {
        // 预览窗口标题
        let previewTitle = `Preview: '${path.basename(window.activeTextEditor.document.fileName)}'`;
        provider = new PreviewDocumentContentProvider();
        // 向vscode为文本内容数据库注册一个URI的协议scheme，以后均可通过该协议与文本内容数据库进行交互
        // html-preview 通过这个scheme访问的内容，都是通过该provider获得的
        registration = workspace.registerTextDocumentContentProvider(PREVIEW_SCHEME, provider);
        // 生成预览临时文件的URI
        previewUri = Uri.parse(`${PREVIEW_SCHEME}://preview/${previewTitle}`);
        // 给vscode发送预览该临时HTML文件的命令
        return commands.executeCommand("vscode.previewHtml", previewUri, displayColumn).then((success) => {
        }, (reason) => {
            console.warn(reason);
            window.showErrorMessage(reason);
        });
    }
    
    // 命令回调函数，该命令在package.json中与快捷方式、菜单选项等关联
    // 侧边栏打开预览界面
    let previewToSide = commands.registerCommand("extension.previewToSide", () => {
        let displayColumn: ViewColumn;
        // 在拆分窗口右侧显示预览界面，若当前待预览HTML文件在最右侧，则覆盖显示
        switch (window.activeTextEditor.viewColumn) {
            case ViewColumn.One:
                displayColumn = ViewColumn.Two;
                break;
            case ViewColumn.Two:
            case ViewColumn.Three:
                displayColumn = ViewColumn.Three;
                break;
        }
        return sendPreviewCommand(displayColumn);
    });
    
    // 覆盖显示预览界面
    let preview = commands.registerCommand("extension.preview", () => {
        return sendPreviewCommand(window.activeTextEditor.viewColumn);
    });
    
    // 注册当前插件由激活变为非激活状态后，自动销毁这些回调函数和资源
    context.subscriptions.push(preview, previewToSide, registration);
}

enum SourceType {
    SCRIPT,
    STYLE
}

class PreviewDocumentContentProvider implements TextDocumentContentProvider {
    // 观察者模式，生成一个事件发生器
    private _onDidChange = new EventEmitter<Uri>();
    private _htmlDocumentContentManager = new htmlDocumentContentManager.HtmlDocumentContentManager();
    private _markdownDocumentContentManager = new markdownDocumentContentManager.MarkdownDocumentContentManager();
   
    // @Override 生成当前html规范化的代码文本，编辑器会自动根据该函数的返回值创建一个只读文档
    // uri是scheme
    public provideTextDocumentContent(uri: Uri): string {
        
        let snippet : string = "";
        let editor = window.activeTextEditor;
        switch (editor.document.languageId) {
            case "html":
            case "jade":
                snippet = this._htmlDocumentContentManager.createHtmlSnippet();
                break;
            case "markdown":
                snippet = this._markdownDocumentContentManager.createHtmlSnippet();
                break;        
            default:
                snippet = this._htmlDocumentContentManager.createHtmlSnippet();
                break;
        }
        return snippet;
    }
    
    // @Override 获取文档变化这个监听事件，给vscode调用
    // 该事件用来向外公开观察者模式，外部监听者通过该接口注册监听，获知文档的变动情况
    get onDidChange(): Event<Uri> {
        return this._onDidChange.event;
    }
    
    // 通知监听者发生待预览HTML文本变化事件
    public update(uri: Uri) {
        this._onDidChange.fire(uri);
    }
    
}
