"use strict";

import * as vscode from "vscode";
import { exec } from "child_process";

import * as path from "path";
let fileUrl = require("file-url");
import {ShellUtil} from "./shellUtil";


export class DocutilsUtil {

    private static docutils(command: string, fileName: string): Promise<string> {
        return ShellUtil.execPromisLike([
            command,
            fileName
        ].join(" "));
    }
    private static docutilsFromSouceCode(command: string, fileName: string): Promise<string> {

        // __dirname 是package.json中"main"字段对应的绝对目录
        // 生成本地文件绝对路径URI
        let source_path =
            path.join(
                __dirname,
                "..",
                "..",
                "..",
                "libs",
                "docutils",
                "tools",
                command
            );
        return ShellUtil.execPromisLike([
            "python",
            source_path,
            fileName
        ].join(" "));
    }

    public static buildhtml(fileName: string): Promise<string> {
        return this.docutils("buildhtml.py", fileName);
    }
    public static rst2html(fileName: string): Promise<string> {
        return this.docutils("rst2html.py", fileName);
    }
    public static rst2html5(fileName: string): Promise<string> {
        return this.docutils("rst2html5.py", fileName);
    }
    public static rst2latex(fileName: string): Promise<string> {
        return this.docutils("rst2latex.py", fileName);
    }
    public static rst2man(fileName: string): Promise<string> {
        return this.docutils("rst2man.py", fileName);
    }
    public static rst2odt(fileName: string): Promise<string> {
        return this.docutils("rst2odt.py", fileName);
    }
    public static rst2odt_prepstyles(fileName: string): Promise<string> {
        return this.docutils("rst2odt_prepstyles.py", fileName);
    }
    public static rst2pseudoxml(fileName: string): Promise<string> {
        return this.docutils("rst2pseudoxml.py", fileName);
    }
    public static rst2s5(fileName: string): Promise<string> {
        return this.docutils("rst2s5.py", fileName);
    }
    public static rst2xetex(fileName: string): Promise<string> {
        return this.docutils("rst2xetex.py", fileName);
    }
    public static rst2xml(fileName: string): Promise<string> {
        return this.docutils("rst2xml.py", fileName);
    }
    public static rstpep2html(fileName: string): Promise<string> {
        return this.docutils("rstpep2html.py", fileName);
    }
}