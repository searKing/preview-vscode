// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');

export namespace MarkdownItAnchor {
    const markdownAnchorSetting = 'markdown.anchor';
    // This method is called when your extension is activated
    // Your extension is activated the very first time the command is executed
    export function extendMarkdownIt(context: vscode.ExtensionContext | undefined, md: MarkdownIt): MarkdownIt {
        function isEnabled(): boolean {
            const config = vscode.workspace.getConfiguration('markdown');
            return config.get<boolean>('anchor.enabled', true);
        }

        function getLevel(): number {
            const config = vscode.workspace.getConfiguration('markdown');
            return config.get<number>('anchor.level', 1);
        }

        if (!!context) {
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(markdownAnchorSetting)) {
                    vscode.commands.executeCommand('markdown.api.reloadPlugins');
                }
            }, undefined, context.subscriptions);
        }
        if (!isEnabled()) {
            return md;
        }
        return md.use(require('markdown-it-anchor').default, {
            level: getLevel(),
        });
    }
}