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

            let blkIndent = state.sCount[startLine];// / 4 * 4;

            let nextLine = startLine;

            while (nextLine < endLine) {
                if (state.isEmpty(nextLine)) {
                    nextLine++;
                    continue;
                }

                // let pos = state.bMarks[startLine] + state.tShift[startLine];
                if (state.sCount[nextLine] >= blkIndent) {
                    state.sCount[nextLine] -= blkIndent;
                    state.bMarks[nextLine] += blkIndent;
                    state.tShift[nextLine] -= blkIndent;
                    nextLine++;
                    continue;
                }
                break;
            }
            return false;
        });
    };
}