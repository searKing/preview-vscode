// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');

export namespace MarkdownItTaskLists {
	const markdownTaskListsSetting = 'markdown.tasklists';
	// This method is called when your extension is activated
	// Your extension is activated the very first time the command is executed
	export function extendMarkdownIt(context: vscode.ExtensionContext | undefined, md: MarkdownIt): MarkdownIt {
		if (!!context) {
			vscode.workspace.onDidChangeConfiguration(e => {
				if (e.affectsConfiguration(markdownTaskListsSetting)) {
					vscode.commands.executeCommand('markdown.api.reloadPlugins');
				}
			}, undefined, context.subscriptions);
		}

		const config = vscode.workspace.getConfiguration('markdown');
		if (!config.get<boolean>('task-lists.enabled', true)) {
			return md;
		}
		return md.use(require('markdown-it-task-lists'), {
			enabled: config.get<boolean>('task-lists.renderCheckboxes', true),
			label: config.get<boolean>('task-lists.label', true),
			labelAfter: config.get<boolean>('task-lists.labelAfter', true)
		});
	}
}