import type MarkdownIt = require('markdown-it');

export type ExtendMarkdownIt<T = any> = (md: MarkdownIt, options?: T) => MarkdownIt;

// Applies the plugins in order.
export function join(...fns: ExtendMarkdownIt[]): ExtendMarkdownIt {
    return (md, options) => fns.reduce((acc, fn) => fn(acc, options), md);
}
