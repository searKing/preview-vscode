import type MarkdownIt = require('markdown-it');
import { MarkdownPreviewManager } from './previewManager';

export namespace MarkdownItCurrentDocument {
	// Must be the first plugin, so that later plugins see the original `state.src`.
	export function extendMarkdownIt<T = any>(md: MarkdownIt, options?: T): MarkdownIt {
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
