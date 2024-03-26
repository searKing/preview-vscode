// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');

export namespace MarkdownItAbbr {
	const markdownAbbrSetting = 'markdown.abbr';
	// This method is called when your extension is activated
	// Your extension is activated the very first time the command is executed
	export function extendMarkdownIt(context: vscode.ExtensionContext | undefined, md: MarkdownIt): MarkdownIt {
		if (!!context) {
			vscode.workspace.onDidChangeConfiguration(e => {
				if (e.affectsConfiguration(markdownAbbrSetting)) {
					vscode.commands.executeCommand('markdown.api.reloadPlugins');
				}
			}, undefined, context.subscriptions);
		}

		const config = vscode.workspace.getConfiguration('markdown', null);
		if (!config.get<boolean>('abbr.enabled', true)) {
			return md;
		}
		return md.use(require('markdown-it-abbr'), {});
	}
}