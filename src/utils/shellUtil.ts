"use strict";

import * as vscode from "vscode";
import { exec } from "child_process";

import * as path from "path";
let fileUrl = require("file-url");
export class ShellUtil {
    public static execPromisLike(cmd: string): Promise<string> {
        return new Promise<string>((resolve) => {
            exec(cmd, (error: Error, stdout: Buffer, stderr: Buffer) => {
                if (error) {
                    let errorMessage = [
                        error.name,
                        error.message,
                        error.stack,
                        "",
                        stderr.toString()
                    ].join("\n");
                    console.error(errorMessage);
                    throw Error(errorMessage);
                }
                resolve(stdout.toString());
            });
        });

    }
}