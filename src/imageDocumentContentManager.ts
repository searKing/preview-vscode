"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import {DocumentContentManagerInterface} from "./documentContentManagerInterface";
import {HtmlUtil, SourceType} from "./utils/htmlUtil";
import {TextUtil, TextUtilReturnType} from "./utils/textUtil"
import * as path from "path";
let fileUrl = require("file-url");

var _instance: ImageDocumentContentManager = null;
export function getInstance() {
    if (!_instance) {
        _instance = new ImageDocumentContentManager();
    }

    return _instance;
}
class ImageDocumentContentManager implements DocumentContentManagerInterface {


    private COMMAND: string = "vscode.previewHtml";
    private IMAGE_TYPE_PREFFIX = ["http", "file://", " /", " ./", "[a-z]"];
    private IMAGE_TYPE_SUFFIX = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
    private IMAGE_TYPE_SPLIT = ['\n', '\r', '\t', ' '];
    // 生成当前编辑页面的可预览代码片段
    // @Override
    public createContentSnippet(): string {
        let editor = window.activeTextEditor;

        let previewSnippet: string = this.generatePreviewSnippet(editor);
        if (previewSnippet == undefined) {
            return HtmlUtil.errorSnippet(`Active editor doesn't show any  ${this.IMAGE_TYPE_SUFFIX} - no properties to preview.`);
        }
        return previewSnippet;
    }

    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        return HtmlUtil.sendPreviewCommand(previewUri, displayColumn);
    }

    private imageSrcSnippet(imageUri: string): string {
        if (imageUri == undefined) {
            return HtmlUtil.errorSnippet(`Active editor doesn't show any  ${this.IMAGE_TYPE_SUFFIX} - no properties to preview.`);
        }
        let snippet = HtmlUtil.createRemoteSource(imageUri, SourceType.IMAGE);
        console.info(snippet);
        return snippet;

    }

    // 获取指定位置开始后的第一个分隔符的位置
    private indexOfSplit(editor: TextEditor, startPos: number): TextUtilReturnType {
        return TextUtil.indexOf(editor, startPos, this.IMAGE_TYPE_SPLIT);
    }
    // 获取指定位置开始后的第一个后缀的位置
    private indexOfSuffix(editor: TextEditor, startPos: number): TextUtilReturnType {
        return TextUtil.indexOf(editor, startPos, this.IMAGE_TYPE_SUFFIX);
    }
    // 获取指定位置开始前的第一个资源前缀的位置
    private lastIndexOfPrefix(editor: TextEditor, startPos: number): TextUtilReturnType {
        return TextUtil.lastIndexOf(editor, startPos, this.IMAGE_TYPE_PREFFIX);
    }
    // 获取指定位置开始前的第一个资源前缀的位置
    private lastIndexOfSuffix(editor: TextEditor, startPos: number): TextUtilReturnType {
        return TextUtil.lastIndexOf(editor, startPos, this.IMAGE_TYPE_SUFFIX);

    }
    // 获取指定位置开始后的第一个分隔符前的最后一个后缀的位置
    private getSelectedLastSuffixNextCharPostion(editor: TextEditor, startPosOfSpilt: number): number {
        // 获取当前页面文本
        let text = editor.document.getText();
        // 获取当前鼠标选中段落的起始位置        
        let startPosOfSelectionText = editor.document.offsetAt(editor.selection.anchor);
        let startPosOfImageUrl = this.lastIndexOfPrefix(editor, startPosOfSelectionText).pos;
        if (startPosOfImageUrl < 0) {
            return -1;
        }
        let startPosOfSplit = this.indexOfSplit(editor, startPosOfImageUrl).pos;
        if (startPosOfSpilt < 0) {
            startPosOfSpilt = editor.document.getText().length;
        }
        let startIndexOfSuffix: TextUtilReturnType = this.lastIndexOfSuffix(editor, startPosOfSpilt);
        let startPosOfSuffix = startIndexOfSuffix.pos;
        let selectedSuffix = startIndexOfSuffix.mark;
        if (startPosOfSuffix > startPosOfImageUrl) {
            return -1
        }

        if (startPosOfSuffix > 0) {
            return startPosOfSuffix + selectedSuffix.length;
        }
        return -1;
    }
    private getFirstSelectedImageUri(editor: TextEditor): string {
        // 获取当前鼠标选中段落的起始位置        
        let startPosOfSelectionText = editor.document.offsetAt(editor.selection.anchor);

        let startPosOfImageUrl: number = this.lastIndexOfPrefix(editor, startPosOfSelectionText).pos;
        if (startPosOfImageUrl < 0) {
            return undefined;
        }

        let startPosOfSpilt = this.indexOfSplit(editor, startPosOfImageUrl).pos;

        let nextCharPostionWhereSuffixIsFound = this.getSelectedLastSuffixNextCharPostion(editor, startPosOfSpilt);


        let endNextPosOfImageUrl: number = -1;
        let needFixCSS = false;
        if (nextCharPostionWhereSuffixIsFound < 0 && startPosOfSpilt < 0) {
            return undefined;
        }
        else if (nextCharPostionWhereSuffixIsFound < 0) {
            endNextPosOfImageUrl = startPosOfSpilt;
        }
        else {
            endNextPosOfImageUrl = nextCharPostionWhereSuffixIsFound;
        }
        let imgSrcUri: string = editor.document.getText().slice(startPosOfImageUrl, endNextPosOfImageUrl);
        return imgSrcUri;
    }


    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): string {
        return HtmlUtil.createLocalSource("header_fix.css", SourceType.LINK) + this.imageSrcSnippet(this.getFirstSelectedImageUri(editor));
    }

}
