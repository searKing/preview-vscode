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
		addHtmlNormalizer(md, markdownPreviewManager);
	};

	// Normalize VS Code file://local_abs_path to relative path to the workspace folder
	function relativePath(link: string, markdownPreviewManager: MarkdownPreviewManager | undefined): string | undefined {
		if (!isOfScheme(Schemes.file, link)) {
			return undefined;
		}
		const uri = vscode.Uri.parse(link);
		if (uri.authority && uri.authority.toLowerCase() !== 'localhost') {
			return undefined; // a file on another host, e.g. file://server/share or file://../a.css (host "..")
		}
		const link_file_path = uri.with({ authority: '' }).fsPath;
		const doc = markdownPreviewManager?.document() ?? vscode.window.activeTextEditor?.document;
		const doc_file_path = doc?.uri?.fsPath;
		if (!doc_file_path || !link_file_path) {
			return undefined;
		}
		return path.relative(path.dirname(doc_file_path), link_file_path);
	}

	function addLinkNormalizer(md: MarkdownIt, markdownPreviewManager: MarkdownPreviewManager | undefined): void {
		const normalizeLink = md.normalizeLink;
		md.normalizeLink = (link: string) => {
			try {
				link = relativePath(link, markdownPreviewManager) ?? link;
			} catch (e) {
				// noop
			}
			return normalizeLink(link);
		};
	}

	// `href` and `src` of raw HTML (e.g. `<link rel="stylesheet" href="file:///...">`, see #99) are not
	// passed to `normalizeLink`, and file:// can't be loaded by the preview.
	const FILE_URI_ATTRIBUTE = /(\s(?:href|src)\s*=\s*)(["'])(file:[^"']*)\2/gi;

	function addHtmlNormalizer(md: MarkdownIt, markdownPreviewManager: MarkdownPreviewManager | undefined): void {
		const normalize = (html: string): string => html.replace(FILE_URI_ATTRIBUTE, (attribute, prefix, quote, link) => {
			try {
				const relative = relativePath(link, markdownPreviewManager);
				if (relative === undefined || path.isAbsolute(relative)) {
					return attribute; // e.g. another drive on Windows
				}
				return `${prefix}${quote}${relative.split(path.sep).map(encodeURIComponent).join('/')}${quote}`;
			} catch (e) {
				return attribute;
			}
		});
		md.core.ruler.push('file-uri-html', (state): void => {
			for (const token of state.tokens) {
				if (token.type === 'html_block') {
					token.content = normalize(token.content);
				}
				for (const child of token.children ?? []) {
					if (child.type === 'html_inline') {
						child.content = normalize(child.content);
					}
				}
			}
		});
		// HTML documents are previewed as an `html` fence, which MarkdownItHTML renders as HTML. Only its
		// output is normalized, the code copy button keeps the source.
		const fence = md.renderer.rules.fence;
		md.renderer.rules.fence = (tokens, idx, options, env, self) => {
			const html = fence ? fence(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
			return tokens[idx].info === 'html' ? normalize(html) : html;
		};
	}
}
