// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt from 'markdown-it';
import { TextEditorHelper, TextEditorHelperReturnType } from './util/textEditorHelper';
import type { ExtendOptions } from './markdown-it';

function extendMarkdownIt(md: MarkdownIt, options?: ExtendOptions): MarkdownIt {
	const config = vscode.workspace.getConfiguration('markdown', null);
	if (!config.get<boolean>('fenced-file.enabled', true)) {
		return md;
	}
	return md.use(fenced_file_render, options);
}

const fenced_file_render = (md: MarkdownIt, options?: ExtendOptions): void => {
	md.core.ruler.before('normalize', 'fenced-file', (state): void => {
		const markdownPreviewManager = options?.markdownPreviewManager;
		const doc = markdownPreviewManager?.document();
		if (!markdownPreviewManager || !doc) {
			// not a document preview, e.g. markdown.api.render or nested render.
			return;
		}
		switch (doc.languageId) {
			case "markdown":
				// nop, use builtin Markdown.
				return;
			case "html":
			case "css":
				// The marker lets preview-styles drop the space the preview adds for editor.scrollBeyondLastLine, see #108.
				state.src = '<div class="preview-vscode-html-document" hidden></div>\n\n```html\n' + `${state.src}` + '\n```';
				return;
			case "mermaid":
				state.src = '```mermaid\n' + `${state.src}` + '\n```';
				return;
			case "restructuredtext":
				state.src = '```rst\n' + `${state.src}` + '\n```';
				return;
			case "jade":
			case "pug":
				state.src = '```pug\n' + `${state.src}` + '\n```';
				return;
			default:
				break;
		}
		const editor = markdownPreviewManager.editor(doc);
		if (!editor) {
			return;
		}
		const url = getFirstSelectedImageUri(editor.document, editor.selection.anchor);
		if (url) {
			state.src = `![${url}](${url})`;
			return;
		}
		return;
	});
};

const IMAGE_TYPE_REGREX_PREFFIX = /http[s]{0,1}:\/\/|file:\/\/|\s[.]{0,2}\//;
const IMAGE_TYPE_REGREX_SUFFIX = /png|jpg|jpeg|gif|bmp|\s/;
const IMAGE_TYPE_REGREX_SPLIT = /\s/;

// 获取指定位置开始后的第一个分隔符的位置
function indexOfSplit(doc: vscode.TextDocument, startPos: number): TextEditorHelperReturnType {
	return TextEditorHelper.regexIndexOf(doc, startPos, IMAGE_TYPE_REGREX_SPLIT);
}

// 获取指定位置开始前的第一个资源前缀的位置
function lastIndexOfPrefix(doc: vscode.TextDocument, startPos: number): TextEditorHelperReturnType {
	return TextEditorHelper.regexLastIndexOf(doc, startPos, IMAGE_TYPE_REGREX_PREFFIX);

}

// 获取指定位置开始前的第一个资源前缀的位置
function lastIndexOfSuffix(doc: vscode.TextDocument, startPos: number): TextEditorHelperReturnType {
	return TextEditorHelper.regexLastIndexOf(doc, startPos, IMAGE_TYPE_REGREX_SUFFIX);
}

// 获取指定位置开始后的第一个分隔符前的最后一个后缀的位置
function getEndOfImageUrl(doc: vscode.TextDocument, startPosOfImageUrl: number, startPosOfSplit: number): number {
	if (!doc) {
		return -1;
	}
	const startIndexOfSuffix: TextEditorHelperReturnType = lastIndexOfSuffix(doc, startPosOfSplit);
	const startPosOfSuffix = startIndexOfSuffix.pos;
	const selectedSuffix = startIndexOfSuffix.mark;
	if (startPosOfSuffix < 0) {
		return startPosOfSplit;
	} else {
		if (startPosOfSuffix < startPosOfImageUrl) {
			return -1;
		}
		if (selectedSuffix.match(/\s+/)) {
			return startPosOfSuffix;
		}
		return startPosOfSuffix + selectedSuffix.length;
	}
}

function getSplitOfImageUrl(doc: vscode.TextDocument, startIndexOfImageUrl: TextEditorHelperReturnType): number {
	if (!doc) {
		return -1;
	}

	let startPosOfSplit = indexOfSplit(doc, startIndexOfImageUrl.pos + startIndexOfImageUrl.mark.length).pos;

	if (startPosOfSplit < 0) {
		startPosOfSplit = doc.getText().length;
	}
	return startPosOfSplit;
}

function getFirstSelectedImageUri(doc: vscode.TextDocument, startPos: vscode.Position): string {
	if (!doc) {
		return "";
	}
	// 获取当前鼠标选中段落的起始位置
	const startPosOfSelectionText = doc.offsetAt(startPos);

	const startIndexOfImageUrl = lastIndexOfPrefix(doc, startPosOfSelectionText);
	const startPosOfImageUrl = startIndexOfImageUrl.pos;
	if (startPosOfImageUrl < 0) {
		return "";
	}

	const startPosOfSplit = getSplitOfImageUrl(doc, startIndexOfImageUrl);

	const endNextPosOfImageUrl: number = getEndOfImageUrl(doc, startPosOfImageUrl, startPosOfSplit);

	if (endNextPosOfImageUrl < 0) {
		return "";
	}
	const imgSrcUri: string = doc.getText().slice(startPosOfImageUrl, endNextPosOfImageUrl);
	return imgSrcUri.trim();
}

export const MarkdownItFencedFile = { extendMarkdownIt };
