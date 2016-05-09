"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as documentContentManagerInterface from "./documentContentManagerInterface";
let fileUrl = require("file-url");


export class ImageDocumentContentManager implements documentContentManagerInterface.DocumentContentManager {


    private COMMAND: string = "vscode.previewHtml";
    private IMAGE_TYPE_SUFFIX = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
    // 生成当前编辑页面的可预览代码片段
    // @Override
    public createContentSnippet(): string {
        let editor = window.activeTextEditor;
        
        let previewSnippet : string = this.generatePreviewSnippet(editor);
        if (previewSnippet == undefined) {
            return this.errorSnippet(`Active editor doesn't show any  ${this.IMAGE_TYPE_SUFFIX} - no properties to preview.`);
        } 
        return this.generatePreviewSnippet(editor);
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
        return `<img src='${imageUri}'/>`;

    }

    private getSelectedImageUri(editor: TextEditor): string {
        // 获取当前页面文本
        let text = editor.document.getText();
        // 获取当前鼠标选中段落的起始位置        
        let startPosOfSelectionText = editor.document.offsetAt(editor.selection.anchor);
        let startPosOfImageUrl = text.lastIndexOf('http', startPosOfSelectionText);
        
        if (startPosOfImageUrl < 0) {
            return undefined;
        }
        var firstSupportedImageSuffix = '';
        var postionWhereSuffixIsFound = -1;
        this.IMAGE_TYPE_SUFFIX.forEach(suffix => {
            // 获取当前扩展名的起始位置
            let startPosOfSuffix = text.indexOf(suffix, startPosOfSelectionText);

            if (startPosOfSuffix > 0) {
                if (postionWhereSuffixIsFound < 0 || startPosOfSuffix < postionWhereSuffixIsFound) {
                    postionWhereSuffixIsFound = startPosOfSuffix;
                    firstSupportedImageSuffix = suffix;
                }
            }
        });

        if (postionWhereSuffixIsFound >= 0) {
            let imgSrcUri: string = text.slice(startPosOfImageUrl, postionWhereSuffixIsFound + firstSupportedImageSuffix.length);
            return imgSrcUri;
        }
    }

    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): string {
        return this.imageSrcSnippet(this.getSelectedImageUri(editor));
    }

}
