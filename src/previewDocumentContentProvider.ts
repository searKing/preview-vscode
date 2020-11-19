import {
    TextEditor, TextDocumentContentProvider, EventEmitter, Event, Uri, ViewColumn
} from "vscode";
import * as path from "path";
import { DocumentContentManagerInterface } from "./manager/documentContentManagerInterface";
import * as htmlDocumentContentManager from "./manager/htmlDocumentContentManager";
import * as pugDocumentContentManager from "./manager/pugDocumentContentManager";
import * as markdownDocumentContentManager from "./manager/markdownDocumentContentManager";
import * as imageDocumentContentManager from "./manager/imageDocumentContentManager";
import * as cssDocumentContentManager from "./manager/cssDocumentContentManager"
import * as mermaidDocumentContentManager from "./manager/mermaidDocumentContentManager"
import * as reStructuredTextDocumentContentManager from "./manager/reStructuredTextDocumentContentManager"
import * as noneDocumentContentManager from "./manager/noneDocumentContentManager"

import { VscodeHelper } from "./util/vscodeHelper"

export class PreviewDocumentContentProvider implements TextDocumentContentProvider {
    static PREVIEW_SCHEME: string = "vscode-preview";
    // private _uriProviderMap: Map<string, DocumentContentManagerInterface> = new Map<string, DocumentContentManagerInterface>();
    // 观察者模式，生成一个事件发生器
    private _onDidChange = new EventEmitter<Uri>();

    private _documentContentManager: DocumentContentManagerInterface | null = null;

    private static _instance: PreviewDocumentContentProvider;
    private constructor() {
        return this;
    }
    public static getInstance(): PreviewDocumentContentProvider {
        if (!PreviewDocumentContentProvider._instance) {
            PreviewDocumentContentProvider._instance = new PreviewDocumentContentProvider();
        }

        return PreviewDocumentContentProvider._instance;
    }
    static get previewScheme(): string {
        return PreviewDocumentContentProvider.PREVIEW_SCHEME;
    }

    // private PreviewDocumentContentProvider(): TextDocumentContentProvider {
    //     return this;
    // };

    private async refreshCurrentDocumentContentProvider(editor: TextEditor): Promise<void> {
        if (!editor || !editor.document) {
            return Promise.reject("editor or editor.document is undefined.");
        }
        let thiz = this;

        //防止在一次预览命令下重复弹出选择预览类型的对话框
        let previewType = await VscodeHelper.getActivePreviewType(editor, false);
        switch (previewType) {
            case "html":
                thiz._documentContentManager = new htmlDocumentContentManager.HtmlDocumentContentManager(editor);
                break;
            case "jade":
            case "pug":
                thiz._documentContentManager = new pugDocumentContentManager.PugDocumentContentManager(editor);
                break;
            case "markdown":
                thiz._documentContentManager = new markdownDocumentContentManager.MarkdownDocumentContentManager(editor);
                break;
            case "css":
                thiz._documentContentManager = new cssDocumentContentManager.CssDocumentContentManager(editor);
                break;
            case "mermaid":
                thiz._documentContentManager = new mermaidDocumentContentManager.MermaidDocumentContentManager(editor);
                break;
            case "rst":
                thiz._documentContentManager = new reStructuredTextDocumentContentManager.ReStructuredTextDocumentContentManager(editor);
                break;
            case "image":
                thiz._documentContentManager = new imageDocumentContentManager.ImageDocumentContentManager(editor);
                break;
            default:
                if (!thiz._documentContentManager) {
                    thiz._documentContentManager = new noneDocumentContentManager.NoneDocumentContentManager(editor);
                }
                break;
        }
        return Promise.resolve();
    }
    // @Override 生成当前html规范化的代码文本，编辑器会自动根据该函数的返回值创建一个只读文档
    // uri是scheme
    public provideTextDocumentContent(_uri: Uri): Thenable<string> {
        let content = async () => {
            if (!this._documentContentManager){
                return "";
            }
            return this._documentContentManager.createContentSnippet();
        }
        return content();
    }

    // @Override 获取文档变化这个监听事件，给vscode调用
    // 该事件用来向外公开观察者模式，外部监听者通过该接口注册监听，获知文档的变动情况
    get onDidChange(): Event<Uri> {
        return this._onDidChange.event;
    }

    // 通知监听者发生待预览HTML文本变化事件
    public update() {
        if (!this._documentContentManager){
            return;
        }
        let fileName = this._documentContentManager.editor().document.fileName;
        let previewUri: Uri = PreviewDocumentContentProvider.getPreviewUri(fileName);
        this._onDidChange.fire(previewUri);
    }

    public async sendPreviewCommand(displayColumn: ViewColumn, editor: TextEditor): Promise<void> {
        await this.refreshCurrentDocumentContentProvider(editor)
        if (!this._documentContentManager){
            return;
        }
        let fileName = this._documentContentManager.editor().document.fileName;
        // 生成预览临时文件的URI
        let previewUri: Uri = await PreviewDocumentContentProvider.getPreviewUri(fileName)
        await this._documentContentManager.sendPreviewCommand(previewUri, displayColumn, editor);
        //主动触发文本更新，因为当预览命令发生变化的时候
        //对于不能判断文本类型的，会弹出文本选择对话框，但是由于文本没有发生变化
        //所以监听者被通知内容更新，还会显示之前缓存下来的内容
        //故而，主动触发通知监听者强制刷新缓存
        return this.update();
    }

    static getPreviewTitle(fileName: string): string {
        return `Preview: '${path.basename(fileName)}'`;
    }
    static getPreviewUri(fileName: string): Uri {
        // 预览窗口标题
        let previewTitle = this.getPreviewTitle(fileName);
        return Uri.parse(`${PreviewDocumentContentProvider.previewScheme}://preview/${previewTitle}`);
    }
}
