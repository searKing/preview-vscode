// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt from 'markdown-it';

// VS Code wraps code blocks in the preview when the editor wraps lines (`body.wordWrap pre`, following
// `editor.wordWrap`), see #101. The marker lets preview-styles/index.css override it for the whole preview.
function extendMarkdownIt(md: MarkdownIt): MarkdownIt {
    const mode = vscode.workspace.getConfiguration('markdown', null).get<string>('code-wrap.mode', 'auto');
    if (mode !== 'on' && mode !== 'off') {
        return md;
    }
    md.core.ruler.push('code-wrap', (state): void => {
        const marker = new state.Token('html_block', '', 0);
        marker.content = `<div class="preview-vscode-code-wrap-${mode}" hidden></div>\n`;
        state.tokens.unshift(marker);
    });
    return md;
}

export const MarkdownItCodeWrap = { extendMarkdownIt };
