"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as path from "path";
import {DocumentContentManagerInterface} from "./documentContentManagerInterface";
import * as htmlDocumentContentManager from "./htmlDocumentContentManager";
import * as markdownDocumentContentManager from "./markdownDocumentContentManager";
import * as imageDocumentContentManager from "./imageDocumentContentManager";
import * as cssDocumentContentManager from "./cssDocumentContentManager"
import * as mermaidDocumentContentManager from "./mermaidDocumentContentManager"
import * as reStructuredTextDocumentContentManager from "./reStructuredTextDocumentContentManager"
import * as noneDocumentContentManager from "./noneDocumentContentManager"


import {MermaidUtil} from "./utils/mermaidUtil";
import {VscodeUtil} from "./utils/vscodeUtil"
enum TextDocumentType {
    HTML,
    MARKDOWN
}

export class PreviewDocumentContentProvider implements TextDocumentContentProvider {
    static PREVIEW_SCHEME: string = "vscode-preview";
    // 观察者模式，生成一个事件发生器
    private _onDidChange = new EventEmitter<Uri>();

    private _documentContentManager: DocumentContentManagerInterface = null;

    static get previewScheme(): string {
        return PreviewDocumentContentProvider.PREVIEW_SCHEME;
    }


    private refreshCurrentDocumentContentProvide(): Promise<void> {
        let editor = window.activeTextEditor;
        let thiz = this;
        //防止在一次预览命令下重复弹出选择预览类型的对话框
        return VscodeUtil.getPreviewType(editor, !!thiz._documentContentManager).then(function (previewType) {
            switch (previewType) {
                case "html":
                case "jade":
                    thiz._documentContentManager = htmlDocumentContentManager.getInstance();
                    break;
                case "markdown":
                    thiz._documentContentManager = markdownDocumentContentManager.getInstance();
                    break;
                case "css":
                    thiz._documentContentManager = cssDocumentContentManager.getInstance();
                    break;
                case "mermaid":
                    thiz._documentContentManager = mermaidDocumentContentManager.getInstance();
                    break;
                case "rst":
                    thiz._documentContentManager = reStructuredTextDocumentContentManager.getInstance();
                    break;
                case "image":
                    thiz._documentContentManager = imageDocumentContentManager.getInstance();
                    break;
                default:
                    if (!thiz._documentContentManager) {
                        thiz._documentContentManager = noneDocumentContentManager.getInstance();                        
                    }
                    break;
            }
            return Promise.resolve();
        });


    }
    // @Override 生成当前html规范化的代码文本，编辑器会自动根据该函数的返回值创建一个只读文档
    // uri是scheme
    public provideTextDocumentContent(uri: Uri): string | Thenable<string> {
        let thiz = this;
        return this.refreshCurrentDocumentContentProvide().then(function () {
            return thiz._documentContentManager.createContentSnippet();
        });
    }

    // @Override 获取文档变化这个监听事件，给vscode调用
    // 该事件用来向外公开观察者模式，外部监听者通过该接口注册监听，获知文档的变动情况
    get onDidChange(): Event<Uri> {
        return this._onDidChange.event;
    }

    // 通知监听者发生待预览HTML文本变化事件
    public update() {
        let previewUri: Uri = PreviewDocumentContentProvider.getPreviewUri();
        this._onDidChange.fire(previewUri);
    }

    public sendPreviewCommand(displayColumn: ViewColumn): Promise<void> {
        let thiz = this;
        return this.refreshCurrentDocumentContentProvide().then(function () {
            // 生成预览临时文件的URI
            let previewUri: Uri = PreviewDocumentContentProvider.getPreviewUri();
            thiz._documentContentManager.sendPreviewCommand(previewUri, displayColumn);
            return Promise.resolve();

        });

    }

    static getPreviewTitle(): string {
        return `Preview: '${path.basename(window.activeTextEditor.document.fileName)}'`;
    }
    static getPreviewUri(): Uri {
        // 预览窗口标题
        let previewTitle = this.getPreviewTitle();
        return Uri.parse(`${PreviewDocumentContentProvider.previewScheme}://preview/${previewTitle}`);
    }
}
