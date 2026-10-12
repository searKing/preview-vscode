import * as vscode from 'vscode';

export class TextEditorHelperReturnType {
    public pos: number;
    public mark: string;
    public constructor(_pos: number, _mark: string) {
        this.pos = _pos;
        this.mark = _mark;
    }
}
export class TextEditorHelper {
    public static NoneTextUtilReturnTypeValue: TextEditorHelperReturnType = new TextEditorHelperReturnType(-1, "");

    public static regexIndexOf(doc: vscode.TextDocument, startPos: number, regex: RegExp): TextEditorHelperReturnType {
        if (!doc) {
            return TextEditorHelper.NoneTextUtilReturnTypeValue;
        }

        // 获取当前页面文本
        let text = doc.getText();

        regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiline ? "m" : ""));
        startPos = startPos || 0;
        // [start, end)
        var stringToWorkWith = text.substring(startPos);
        var closestPosOfMarks = -1;
        var closestMarkOfMarks = "";
        var result: RegExpExecArray | null = null;
        if ((result = regex.exec(stringToWorkWith)) !== null) {
            closestMarkOfMarks = result[0];
            closestPosOfMarks = result.index + startPos;
        }
        return new TextEditorHelperReturnType(closestPosOfMarks, closestMarkOfMarks);

    }
    public static regexLastIndexOf(doc: vscode.TextDocument, startPos: number, regex: RegExp): TextEditorHelperReturnType {
        if (!doc) {
            return TextEditorHelper.NoneTextUtilReturnTypeValue;
        }
        // 获取当前页面文本
        let text = doc.getText();
        regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiline ? "m" : ""));
        if (typeof (startPos) === "undefined") {
            startPos = text.length;
        } else if (startPos < 0) {
            startPos = 0;
        }

        // [start, end)
        var stringToWorkWith = text.substring(0, startPos + 1);
        var closestPosOfMarks = -1;
        var result: RegExpExecArray | null = null;
        var closestMarkOfMarks = "";
        while ((result = regex.exec(stringToWorkWith)) !== null) {
            closestPosOfMarks = result.index;
            closestMarkOfMarks = result[0];
            // restart right after the match start, so overlapping matches are still found.
            regex.lastIndex = result.index + 1;
        }
        return new TextEditorHelperReturnType(closestPosOfMarks, closestMarkOfMarks);
    }
}
