import type MarkdownIt from 'markdown-it';
import type { ExtendOptions } from './markdown-it';

// Must be the first plugin, so that later plugins see the original `state.src`.
function extendMarkdownIt(md: MarkdownIt, options?: ExtendOptions): MarkdownIt {
	const markdownPreviewManager = options?.markdownPreviewManager;
	if (!markdownPreviewManager) {
		return md;
	}
	md.core.ruler.before('normalize', 'current-document', (state): void => {
		markdownPreviewManager.resolveDocument(state.src);
	});
	return md;
}

export const MarkdownItCurrentDocument = { extendMarkdownIt };
