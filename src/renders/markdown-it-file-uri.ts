// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');
import { isOfScheme, Schemes } from './util/schemes';
import path = require('path');
import { MarkdownPreviewManager } from './previewManager';

export namespace MarkdownItFileUri {
	export function extendMarkdownIt<T = any>(md: MarkdownIt, options?: T): MarkdownIt {
		const config = vscode.workspace.getConfiguration('markdown', null);
		if (!config.get<boolean>('file-uri.enabled', true)) {
			return md;
		}
		return md.use(file_uri_render, options);
	}

	const file_uri_render = <T = any>(md: MarkdownIt, options?: T): void => {
		const markdownPreviewManager: MarkdownPreviewManager | undefined = (options as any)?.['markdownPreviewManager'];
		addLinkNormalizer(md, markdownPreviewManager);
	};

	function addLinkNormalizer(md: MarkdownIt, markdownPreviewManager: MarkdownPreviewManager | undefined): void {
		const normalizeLink = md.normalizeLink;
		md.normalizeLink = (link: string) => {
			try {
				// Normalize VS Code file://local_abs_path to relative path to the workspace folder
				if (isOfScheme(Schemes.file, link)) {
					const link_file_path = vscode.Uri.parse(link)?.fsPath;
					const doc = markdownPreviewManager?.document() ?? vscode.window.activeTextEditor?.document;
					const doc_file_path = doc?.uri?.fsPath;
					if (doc_file_path && link_file_path) {
						link = path.relative(path.dirname(doc_file_path), link_file_path);
					}
				}
			} catch (e) {
				// noop
			}
			return normalizeLink(link);
		};
	}
}


