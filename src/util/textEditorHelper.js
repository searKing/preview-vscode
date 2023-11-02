export class TextEditorHelperReturnType {
    constructor(_pos, _mark) {
        this.pos = _pos;
        this.mark = _mark;
    }
}
export class TextEditorHelper {
    // 获取指定位置开始后的第一个任意mark的位置
    static indexOf(editor, startPos, marks) {
        if (!editor || !editor.document) {
            return TextEditorHelper.NoneTextUtilReturnTypeValue;
        }
        // 获取当前页面文本
        let text = editor.document.getText();
        var closestPosOfMarks = -1;
        var isAnyMarkFound = false;
        var closestMarkOfMarks = "";
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
        return new TextEditorHelperReturnType(closestPosOfMarks, closestMarkOfMarks);
    }
    // 获取指定位置开始后的第一个任意mark的位置
    static lastIndexOf(editor, startPos, marks) {
        if (!editor || !editor.document) {
            return TextEditorHelper.NoneTextUtilReturnTypeValue;
        }
        // 获取当前页面文本
        let text = editor.document.getText();
        var closestPosOfMarks = -1;
        var closestMarkOfMarks = "";
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
        return new TextEditorHelperReturnType(closestPosOfMarks, closestMarkOfMarks);
    }
    static regexIndexOf(editor, startPos, regex) {
        if (!editor || !editor.document) {
            return TextEditorHelper.NoneTextUtilReturnTypeValue;
        }
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
        var closestMarkOfMarks = "";
        var result = null;
        if ((result = regex.exec(stringToWorkWith)) != null) {
            closestMarkOfMarks = result[0];
            closestPosOfMarks = result.index + startPos;
        }
        return new TextEditorHelperReturnType(closestPosOfMarks, closestMarkOfMarks);
    }
    static regexLastIndexOf(editor, startPos, regex) {
        if (!editor || !editor.document) {
            return TextEditorHelper.NoneTextUtilReturnTypeValue;
        }
        // 获取当前页面文本
        let text = editor.document.getText();
        regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiline ? "m" : ""));
        if (typeof (startPos) == "undefined") {
            startPos = text.length;
        }
        else if (startPos < 0) {
            startPos = 0;
        }
        // [start, end)
        var stringToWorkWith = text.substring(0, startPos + 1);
        var closestPosOfMarks = -1;
        var nextStop = 0;
        var result = null;
        var closestMarkOfMarks = "";
        while ((result = regex.exec(stringToWorkWith)) != null) {
            closestPosOfMarks = result.index;
            closestMarkOfMarks = result[0];
            regex.lastIndex = ++nextStop;
        }
        return new TextEditorHelperReturnType(closestPosOfMarks, closestMarkOfMarks);
    }
    // 将字符串中的%1~$n 替换为输入参数列表，变长参数，因为%0是str，所以无需替换
    // 类似C/Java的format
    static format(str) {
        var args = arguments;
        var pattern = new RegExp("%([1-" + arguments.length + "])", "g");
        return String(str).replace(pattern, function (_match, index) {
            return args[index];
        });
    }
    ;
    /**
     * 版本比较 VersionCompare
     * @param {String} currVer 当前版本.
     * @param {String} promoteVer 比较版本.
     * @return {Boolean} false 当前版本小于比较版本返回 true.
     * Major_Version_Number.Minor_Version_Number[.Revision_Number[.Build_Number]]
     * 主版本号             .子版本号              [.修正版本号       [.编译版本号  ]]
     * 使用
     * VersionCompare("6.3","5.2.5"); // false.
     * VersionCompare("6.1", "6.1"); // false.
     * VersionCompare("6.1.5", "6.2"); // true.
     */
    static versionCompare(curVer, promoteVer) {
        curVer = curVer || "0.0.0";
        promoteVer = promoteVer || "0.0.0";
        curVer = curVer.trim();
        promoteVer = promoteVer.trim();
        if (curVer == promoteVer) {
            return 0;
        }
        let curVerArray = curVer.split(".");
        let promoteVerArr = promoteVer.split(".");
        let len = Math.max(curVerArray.length, promoteVerArr.length);
        for (let i = 0; i < len; i++) {
            let curSubVer = curVerArray[i];
            let promoteVer = promoteVerArr[i];
            // |0和~~是很好的一个例子，使用这两者可以将浮点转成整型且效率方面要比同类的parseInt,Math.round 要快。在处理像素及动画位移等效果的时候会很有用
            let curSubVerNo = ~~curSubVer.trim();
            let promoteVerNo = ~~promoteVer.trim();
            if (curSubVerNo < promoteVerNo) {
                return -1;
            }
            else if (curSubVerNo > promoteVerNo) {
                return 1;
            }
        }
        return 0;
    }
}
TextEditorHelper.NoneTextUtilReturnTypeValue = new TextEditorHelperReturnType(-1, "");
//# sourceMappingURL=textEditorHelper.js.map