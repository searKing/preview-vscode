"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as documentContentManagerInterface from "./documentContentManagerInterface";
import * as path from "path";
let fileUrl = require("file-url");

enum SourceType {
    SCRIPT,
    STYLE
}
var _instance: ImageDocumentContentManager = null;
export function getInstance() {
    if (!_instance) {
        _instance = new ImageDocumentContentManager();
    }

    return _instance;
}
class ImageDocumentContentManager implements documentContentManagerInterface.DocumentContentManager {


    private COMMAND: string = "vscode.previewHtml";
    private IMAGE_TYPE_SUFFIX = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
    private IMAGE_TYPE_SPLIT = ['\n', '\r', '\t', ' '];
    // 生成当前编辑页面的可预览代码片段
    // @Override
    public createContentSnippet(): string {
        let editor = window.activeTextEditor;

        let previewSnippet: string = this.generatePreviewSnippet(editor);
        if (previewSnippet == undefined) {
            return this.errorSnippet(`Active editor doesn't show any  ${this.IMAGE_TYPE_SUFFIX} - no properties to preview.`);
        }
        return previewSnippet;
    }

    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        return commands.executeCommand(this.COMMAND, previewUri, displayColumn).then((success) => {
        }, (reason) => {
            console.warn(reason);
            window.showErrorMessage(reason);
        });
    }

    // 获得错误信息对应的html代码片段
    private errorSnippet(error: string): string {
        return `
                #${error}
                `;
    }
    private imageSrcSnippet(imageUri: string): string {
        if (imageUri == undefined) {
            return this.errorSnippet(`Active editor doesn't show any  ${this.IMAGE_TYPE_SUFFIX} - no properties to preview.`);
        }
        let snippet = `<img src='${imageUri}'/>`;
        console.info(snippet); 
        return snippet;

    }

    // 获取指定位置开始后的第一个分隔符的位置
    private getSelectedFirstSplitPostion(editor: TextEditor, startPosOfSelectionText:number): number {
        // 获取当前页面文本
        let text = editor.document.getText();

        var closetPosOfSupportedImageSplit = -1;
        var isSplitFound = false;
        this.IMAGE_TYPE_SPLIT.forEach(split => {
            // 获取当前扩展名的起始位置
            let startPosOfSplit = text.indexOf(split, startPosOfSelectionText);
            if (startPosOfSplit < 0) {
                return;
            }
            if (!isSplitFound || startPosOfSplit < closetPosOfSupportedImageSplit) {
                isSplitFound = true;
                closetPosOfSupportedImageSplit = startPosOfSplit;
                return;
            }
        });

        if (isSplitFound) {
            return closetPosOfSupportedImageSplit;
        }
        return -1;
    }
    // 获取指定位置开始后的第一个分隔符前的最后一个后缀的位置
    private getSelectedLastSuffixNextCharPostion(editor: TextEditor, startPosOfSpilt: number): number {
        // 获取当前页面文本
        let text = editor.document.getText();
        // 获取当前鼠标选中段落的起始位置        
        let startPosOfSelectionText = editor.document.offsetAt(editor.selection.anchor);
        let startPosOfImageUrl = text.lastIndexOf('http', startPosOfSelectionText);


        var farthestPosOfSupportetSuffix = -1;
        var isSuffixFound = false;
        var selectedSuffix = '';
        this.IMAGE_TYPE_SUFFIX.forEach(suffix => {
            // 获取当前扩展名的起始位置
            let startPosOfSuffix = text.indexOf(suffix, startPosOfImageUrl);
            if (startPosOfSuffix < 0) {
                return;
            }
            if (startPosOfSpilt > 0 && startPosOfSuffix > startPosOfSpilt) {
                return;
            }
            if (!isSuffixFound
                || (startPosOfSuffix > farthestPosOfSupportetSuffix)) {
                isSuffixFound = true;
                selectedSuffix = suffix;
                farthestPosOfSupportetSuffix = startPosOfSuffix;
                return;
            }
        });

        if (isSuffixFound) {
            return farthestPosOfSupportetSuffix + selectedSuffix.length;
        }
        return -1;
    }
    private getFirstSelectedImageUri(editor: TextEditor): string {
        // 获取当前页面文本
        let text = editor.document.getText();
        // 获取当前鼠标选中段落的起始位置        
        let startPosOfSelectionText = editor.document.offsetAt(editor.selection.anchor);
        let startPosOfImageUrl = text.lastIndexOf('http', startPosOfSelectionText);

        if (startPosOfImageUrl < 0) {
            return undefined;
        }

        let startPosOfSpilt = this.getSelectedFirstSplitPostion(editor,startPosOfImageUrl);

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
        let imgSrcUri: string = text.slice(startPosOfImageUrl, endNextPosOfImageUrl);
        return imgSrcUri;
    }    
    // 生成本地文件对应URI的html标签代码片段
    private createLocalSource(file: string, type: SourceType) {
        // __dirname 是package.json中"main"字段对应的绝对目录
        // 生成本地文件绝对路径URI
        let source_path = fileUrl(
            path.join(
                __dirname,
                "..",
                "..",
                "static",
                file
            )
        );
        switch (type) {
            case SourceType.SCRIPT:
                return `<script src="${source_path}"></script>`;
            case SourceType.STYLE:
                return `<link href="${source_path}" rel="stylesheet" />`;
        }
    }

    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): string {
        return this.createLocalSource("header_fix.css",SourceType.STYLE)+ this.imageSrcSnippet(this.getFirstSelectedImageUri(editor));
    }

}
