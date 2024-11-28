// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');

export namespace MarkdownItIndentedCode {
    const markdownIndentedCodeSetting = 'markdown-it-indented-code';

    // This method is called when your extension is activated
    // Your extension is activated the very first time the command is executed
    export function extendMarkdownIt<T = any>(context: vscode.ExtensionContext | undefined, md: MarkdownIt, options?: T): MarkdownIt {
        if (!!context) {
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(markdownIndentedCodeSetting)) {
                    vscode.commands.executeCommand('markdown.api.reloadPlugins');
                }
            }, undefined, context.subscriptions);
        }
        const config = vscode.workspace.getConfiguration('markdown', null);
        if (config.get<boolean>('indented-code.enabled', true)) {
            return md;
        }
        return md.use(indented_code_render, options);
    };

    const indented_code_render = <T = any>(md: MarkdownIt, _?: T): void => {

        // Allow disabling indented code blocks in the Markdown previewer.
        // https://github.com/microsoft/vscode/issues/234485#issue-2686563242
        md.block.ruler.disable('code');
        md.block.ruler.before('code', 'indented-code', (state, startLine, endLine, silent): boolean => {
            if (state.sCount[startLine] - state.blkIndent < 4) { return false; }
            // Since start is found, we can report success here in validation mode
            if (silent) { return true; }

            let blkIndent = state.sCount[startLine];// tab expanded

            let nextLine = startLine;

            while (nextLine < endLine) {
                if (state.isEmpty(nextLine)) {
                    nextLine++;
                    continue;
                }

                if (state.sCount[nextLine] >= blkIndent) {
                    // remove expanded tab
                    let line = nextLine;
                    let end = state.eMarks[nextLine];
                    let indent = blkIndent;// tab expanded
                    let lineIndent = 0; // tab expanded
                    const lineStart = state.bMarks[line];
                    let first = lineStart;
                    let last;

                    if (line + 1 < end) {
                        // No need for bounds check because we have fake entry on tail.
                        last = state.eMarks[line] + 1;
                    } else {
                        last = state.eMarks[line];
                    }

                    while (first < last && lineIndent < indent) {
                        const ch = state.src.charCodeAt(first)

                        if (isSpace(ch)) {
                            if (ch === 0x09) {
                                lineIndent += 4 - (lineIndent + state.bsCount[line]) % 4;
                            } else {
                                lineIndent++;
                            }
                        } else if (first - lineStart < state.tShift[line]) {
                            // patched tShift masked characters to look like spaces (blockquotes, list markers)
                            lineIndent++;
                        } else {
                            break;
                        }

                        first++;
                    }

                    state.sCount[nextLine] -= lineIndent;
                    state.bMarks[nextLine] = first;
                    state.tShift[nextLine] -= (first - lineStart);

                    nextLine++;
                    continue;
                }
                break;
            }
            // let pos = state.bMarks[startLine] + state.tShift[startLine];
            // let max = state.eMarks[startLine];
            // let lineText = state.src.slice(pos, max);
            // let content = state.getLines(startLine, nextLine, state.blkIndent, true);
            return false;
        });
    };

    function isSpace(code: number): boolean {
        switch (code) {
            case 0x09:
            case 0x20:
                return true;
        }
        return false;
    }
}