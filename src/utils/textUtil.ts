"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as path from "path";
let fileUrl = require("file-url");

export class TextUtilReturnType {
    public pos: number;
    public mark: string;
    public constructor(_pos: number, _mark: string) {
        this.pos = _pos;
        this.mark = _mark;
    }
}
export class TextUtil {

    // 获取指定位置开始后的第一个任意mark的位置
    public static indexOf(editor: TextEditor, startPos: number, marks: string[]): TextUtilReturnType {
        // 获取当前页面文本
        let text = editor.document.getText();

        var closestPosOfMarks = -1;
        var isAnyMarkFound = false;
        var closestMarkOfMarks = undefined;
        marks.forEach(mark => {
            // 获取当前扩展名的起始位置
            let startPosOfMark = text.indexOf(mark, startPos);
            if (startPosOfMark < 0) {
                return;
            }
            if (!isAnyMarkFound || startPosOfMark < closestPosOfMarks) {
                isAnyMarkFound = true;
                closestPosOfMarks = startPosOfMark;
                closestMarkOfMarks = mark;
                return;
            }
        });

        return new TextUtilReturnType(closestPosOfMarks, closestMarkOfMarks);
    }

    // 获取指定位置开始后的第一个任意mark的位置
    public static lastIndexOf(editor: TextEditor, startPos: number, marks: string[]): TextUtilReturnType {
        // 获取当前页面文本
        let text = editor.document.getText();

        var closestPosOfMarks = -1;
        var closestMarkOfMarks = undefined;
        var isAnyMarkFound = false;
        marks.forEach(mark => {
            // 获取当前扩展名的起始位置
            let startPosOfMark = text.lastIndexOf(mark, startPos);
            if (startPosOfMark < 0) {
                return;
            }
            if (!isAnyMarkFound || startPosOfMark > closestPosOfMarks) {
                isAnyMarkFound = true;
                closestPosOfMarks = startPosOfMark;
                closestMarkOfMarks = mark;
                return;
            }
        });

        return new TextUtilReturnType(closestPosOfMarks, closestMarkOfMarks);

    }

    public static regexIndexOf(editor: TextEditor, startPos: number, regex: RegExp): TextUtilReturnType {

        // 获取当前页面文本
        let text = editor.document.getText();
        // var indexOf = text.substring(startPos || 0).search(regex);
        // var closestPosOfMarks = (indexOf >= 0) ? (indexOf + (startPos || 0)) : indexOf;
        // return new TextUtilReturnType(closestPosOfMarks, closestMarkOfMarks);

        regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiline ? "m" : ""));
        startPos = startPos || 0;
        // [start, end)
        var stringToWorkWith = text.substring(startPos);
        var closestPosOfMarks = -1;
        var closestMarkOfMarks = undefined;
        var result: RegExpExecArray = null;
        if ((result = regex.exec(stringToWorkWith)) != null) {
            closestMarkOfMarks = result[0];
            closestPosOfMarks = result.index + startPos;
        }
        return new TextUtilReturnType(closestPosOfMarks, closestMarkOfMarks);

    }
    public static regexLastIndexOf(editor: TextEditor, startPos: number, regex: RegExp): TextUtilReturnType {
        // 获取当前页面文本
        let text = editor.document.getText();
        regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiline ? "m" : ""));
        if (typeof (startPos) == "undefined") {
            startPos = text.length;
        } else if (startPos < 0) {
            startPos = 0;
        }

        // [start, end)
        var stringToWorkWith = text.substring(0, startPos + 1);
        var closestPosOfMarks = -1;
        var nextStop = 0;
        var result: RegExpExecArray = null;
        var closestMarkOfMarks = undefined;
        while ((result = regex.exec(stringToWorkWith)) != null) {
            closestPosOfMarks = result.index;
            closestMarkOfMarks = result[0];
            regex.lastIndex = ++nextStop;
        }
        return new TextUtilReturnType(closestPosOfMarks, closestMarkOfMarks);
    }
}