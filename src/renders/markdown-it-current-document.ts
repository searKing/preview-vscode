// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');
import { MarkdownPreviewManager } from './previewManager';

export namespace MarkdownItCurrentDocument {
	// Must be the first plugin, so that later plugins see the original `state.src`.
	export function extendMarkdownIt<T = any>(_context: vscode.ExtensionContext | undefined, md: MarkdownIt, options?: T): MarkdownIt {
		const markdownPreviewManager: MarkdownPreviewManager | undefined = (options as any)?.['markdownPreviewManager'];
		if (!markdownPreviewManager) {
			return md;
		}
		md.core.ruler.before('normalize', 'current-document', (state): void => {
			markdownPreviewManager.resolveDocument(state.src);
		});
		return md;
	}
}
