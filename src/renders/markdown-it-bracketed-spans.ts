// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');

export namespace MarkdownItBracketedSpans {
    const markdownBracketedSpansSetting = 'markdown.bracketed-spans';
    // This method is called when your extension is activated
    // Your extension is activated the very first time the command is executed
    export function extendMarkdownIt(context: vscode.ExtensionContext | undefined, md: MarkdownIt): MarkdownIt {
        if (!!context) {
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(markdownBracketedSpansSetting)) {
                    vscode.commands.executeCommand('markdown.api.reloadPlugins');
                }
            }, undefined, context.subscriptions);
        }

        const config = vscode.workspace.getConfiguration('markdown');
        if (!config.get<boolean>('bracketed-spans.enabled', true)) {
            return md;
        }
        return md.use(require('markdown-it-bracketed-spans'), {});
    }
}