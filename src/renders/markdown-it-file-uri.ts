// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MarkdownIt = require('markdown-it');
import { isOfScheme, Schemes } from './util/schemes';
import path = require('path');

export namespace MarkdownItFileUri {
	const markdownUriSetting = 'markdown.file-url';

	// This method is called when your extension is activated
	// Your extension is activated the very first time the command is executed
	export function extendMarkdownIt<T = any>(context: vscode.ExtensionContext | undefined, md: MarkdownIt, options?: T): MarkdownIt {
		if (!!context) {
			vscode.workspace.onDidChangeConfiguration(e => {
				if (e.affectsConfiguration(markdownUriSetting)) {
					vscode.commands.executeCommand('markdown.api.reloadPlugins');
				}
			}, undefined, context.subscriptions);
		}

		const config = vscode.workspace.getConfiguration('markdown', null);
		if (!config.get<boolean>('file-uri.enabled', true)) {
			return md;
		}
		return md.use(file_uri_render, options);
	}

	const file_uri_render = <T = any>(md: MarkdownIt, _?: T): void => {
		addLinkNormalizer(md);
	};

	function addLinkNormalizer(md: MarkdownIt): void {
		const normalizeLink = md.normalizeLink;
		md.normalizeLink = (link: string) => {
			try {
				// Normalize VS Code file://local_abs_path to relative path to the workspace folder
				if (isOfScheme(Schemes.file, link)) {
					const doc = vscode.window.activeTextEditor?.document;
					if (doc) {
						const absolute_path = vscode.Uri.parse(link)?.fsPath;
						const workspace_dir = vscode.workspace.getWorkspaceFolder(doc.uri)?.uri?.fsPath;
						if (workspace_dir && absolute_path) {
							link = path.relative(workspace_dir, absolute_path);
						}
					}
				}
			} catch (e) {
				// noop
			}
			return normalizeLink(link);
		};
	}
}

