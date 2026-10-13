// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');

export namespace MarkdownItIndentedCode {
    export function extendMarkdownIt<T = any>(md: MarkdownIt, options?: T): MarkdownIt {
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

            // Dedent the over-indented lines down to the enclosing block's indent (not to 0, which
            // would end an enclosing list item, see #106) and let the other rules parse them.
            const blockIndent = state.sCount[startLine]; // tab expanded
            const indent = blockIndent - state.blkIndent;

            for (let line = startLine; line < endLine; line++) {
                if (state.isEmpty(line)) {
                    continue;
                }
                if (state.sCount[line] < blockIndent) {
                    break;
                }
                const lineStart = state.bMarks[line];
                const last = state.eMarks[line];
                let first = lineStart;
                let lineIndent = 0; // tab expanded

                while (first < last) {
                    const ch = state.src.charCodeAt(first);
                    let width: number;
                    if (ch === 0x09) {
                        width = 4 - (lineIndent + state.bsCount[line]) % 4;
                    } else if (ch === 0x20 || first - lineStart < state.tShift[line]) {
                        // patched tShift masked characters look like spaces (blockquotes, list markers)
                        width = 1;
                    } else {
                        break;
                    }
                    if (lineIndent + width > indent) {
                        break; // keep a tab that crosses the enclosing block's indent
                    }
                    lineIndent += width;
                    first++;
                }

                state.sCount[line] -= lineIndent;
                state.bsCount[line] += lineIndent;
                state.bMarks[line] = first;
                state.tShift[line] -= first - lineStart;
            }
            return false;
        });
    };
}