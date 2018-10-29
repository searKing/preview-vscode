"use strict";
import { exec } from "child_process";

export class ShellUtil {
    public static execPromisLike(cmd: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {

            exec(cmd, (error: Error | null, stdout: string, stderr: string) => {
                if (error) {
                    let errorMessage = [
                        error.name,
                        error.message,
                        error.stack,
                        "",
                        stderr.toString()
                    ].join("\n");
                    reject(errorMessage);
                    return;
                }
                resolve(stdout.toString());
                return;
            });
        });

    }
}