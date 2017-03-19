"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import { PreviewDocumentContentProvider } from "./previewDocumentContentProvider";

// 主函数
export function activate(context: ExtensionContext) {

    // 文本内容提供者
    let provider: PreviewDocumentContentProvider;
    let registration: Disposable;

    // 向vscode注册当前文件发生变化时的回调函数
    workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
        if (!!e && !!window.activeTextEditor && e.document === window.activeTextEditor.document) {
            // 由于文档变动必然在插件启动之后，而插件启动时就已经创建了provider
            // 因此不存在该变量未定义的问题
            provider.update();
        }
    });

    window.onDidChangeTextEditorSelection((e: TextEditorSelectionChangeEvent) => {
        if (!!e && !!e.textEditor && (e.textEditor === window.activeTextEditor)) {
            provider.update();
        }
    })

    function registerPreviewDocumentContentProvider() {
        provider = new PreviewDocumentContentProvider();
        // 向vscode为文本内容数据库注册一个URI的协议scheme，以后均可通过该协议与文本内容数据库进行交互
        // html-preview 通过这个scheme访问的内容，都是通过该provider获得的
        registration = workspace.registerTextDocumentContentProvider(PreviewDocumentContentProvider.previewScheme, provider);
    }
    // 调用vscode系统命令预览当前HTML页面
    function sendPreviewCommand(displayColumn: ViewColumn): void {
        registerPreviewDocumentContentProvider();
        // 给vscode发送预览该临时HTML文件的命令
        provider.sendPreviewCommand(displayColumn).catch(function (error) {
            console.error("we got an error: " + error);
        });
        return;
    }
    // 调用vscode系统命令返回当前之前的页面
    function sendBackviewCommand(): PromiseLike<void> {
        // 给vscode发送返回预览之前页面的位置
        return commands.executeCommand("workbench.action.navigateBack").then((success) => {
        }, (reason) => {
            console.warn(reason);
            window.showErrorMessage(reason);
        });
    }
    // 调用vscode系统命令关闭当前预览的页面
    function sendCloseviewCommand(): PromiseLike<void> {
        // 给vscode发送返回预览之前页面的位置
        return commands.executeCommand("workbench.action.closeActiveEditor").then((success) => {
        }, (reason) => {
            console.warn(reason);
            window.showErrorMessage(reason);
        });
    }
    function getSpiltColumn(): ViewColumn {
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
            default:
                displayColumn = window.activeTextEditor.viewColumn;
                break;
        }
        return displayColumn;
    }
    // 命令回调函数，该命令在package.json中与快捷方式、菜单选项等关联
    // 侧边栏打开预览界面
    let previewToSide = commands.registerCommand("extension.previewToSide", () => {
        if (!!window.activeTextEditor) {
            return sendCloseviewCommand();
        }
        let displayColumn: ViewColumn = getSpiltColumn();
        return sendPreviewCommand(displayColumn);
    });

    // 覆盖显示预览界面
    let preview = commands.registerCommand("extension.preview", () => {
        if (!!window.activeTextEditor) {
            return sendBackviewCommand();
        }
        return sendPreviewCommand(window.activeTextEditor.viewColumn);
    });

    // 注册当前插件由激活变为非激活状态后，自动销毁这些回调函数和资源
    context.subscriptions.push(preview, previewToSide, registration);
}

// this method is called when your extension is deactivated
export function deactivate() {
    console.log("Preview Extension Shutdown");
}
