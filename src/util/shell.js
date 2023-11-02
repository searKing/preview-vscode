import { exec } from 'child_process';
export class Shell {
    static execPromisLike(cmd) {
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
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
//# sourceMappingURL=shell.js.map