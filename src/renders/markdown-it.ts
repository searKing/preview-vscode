import type MarkdownIt from 'markdown-it';
import type { MarkdownPreviewManager } from './previewManager';

export interface ExtendOptions {
    // unset when not rendering a document preview, e.g. markdown.api.render or nested renders.
    markdownPreviewManager?: MarkdownPreviewManager;
}

export type ExtendMarkdownIt = (md: MarkdownIt, options?: ExtendOptions) => MarkdownIt;

// Applies the plugins in order.
export function join(...fns: ExtendMarkdownIt[]): ExtendMarkdownIt {
    return (md, options) => fns.reduce((acc, fn) => fn(acc, options), md);
}
