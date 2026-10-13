/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import type MarkdownIt from 'markdown-it';
import abbr from 'markdown-it-abbr';
import anchor from 'markdown-it-anchor';
import attrs from 'markdown-it-attrs';
import bracketedSpans from 'markdown-it-bracketed-spans';
import cjkBreaks from 'markdown-it-cjk-breaks';
import deflist from 'markdown-it-deflist';
import { full as emoji } from 'markdown-it-emoji';
import expandTabs from 'markdown-it-expand-tabs';
import footnote from 'markdown-it-footnote';
import highlightjs from 'markdown-it-highlightjs';
import ins from 'markdown-it-ins';
import lazyHeaders from 'markdown-it-lazy-headers';
import mark from 'markdown-it-mark';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import type { RendererContext } from 'vscode-notebook-renderer';
import { markdownWithFrontMatter } from '../renders/highlightjs-markdown';
import taskLists from '../renders/markdown-it-task-lists';

interface MarkdownItRenderer {
    extendMarkdownIt(fn: (md: MarkdownIt) => void): void;
}

export async function activate(ctx: RendererContext<void>) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your renderer "preview-vscode" is now active!');

    const markdownItRenderer = await ctx.getRenderer('vscode.markdown-it-renderer') as MarkdownItRenderer | undefined;
    if (!markdownItRenderer) {
        throw new Error(`Could not load 'vscode.markdown-it-renderer'`);
    }

    const style = document.createElement('style');
    style.textContent = `
		.preview-vscode-error {
			color: var(--vscode-editorError-foreground);
		}
		.preview-vscode-block {
			counter-reset: mmlEqnNo;
		}
		.task-list-item {
			list-style-type: none;
		}
		.task-list-item-checkbox {
			margin-block: 0 0.25em;
			margin-inline: -1.4em 0.2em;
			vertical-align: middle;
		}
	`;

    // Put Everything into a template
    const styleTemplate = document.createElement('template');
    styleTemplate.classList.add('markdown-style');
    styleTemplate.content.appendChild(style);
    document.head.appendChild(styleTemplate);

    markdownItRenderer.extendMarkdownIt((md: MarkdownIt) => {
        return md.use(abbr, {}).
            use(anchor, {}).
            use(bracketedSpans, {}).
            use(highlightjs, { register: { markdown: markdownWithFrontMatter } }).
            // its types are written against the CommonJS declarations of markdown-it, which don't match the ESM ones.
            use(attrs as unknown as Parameters<MarkdownIt['use']>[0], {}).
            use(cjkBreaks, {}).
            use(deflist, {}).
            use(emoji, { shortcuts: {} }).
            use(expandTabs, { tabWidth: 2 }).
            use(footnote, {}).
            use(ins, {}).
            use(lazyHeaders, {}).
            use(mark, {}).
            use(sub, {}).
            use(sup, {}).
            use(taskLists, {
                enabled: true, // render checkboxes
                label: true, // wrap the rendered list items in a <label> element for UX purposes
                labelAfter: false // add the <label> after the checkbox
            }).
            use(mermaidPlugin);
    });
}

let nextMermaidBlockId = 0;

function mermaidTheme(): string {
    const classList = document.body.classList;
    return classList.contains('vscode-dark') || classList.contains('vscode-high-contrast') ? 'dark' : 'default';
}

// Cells are rendered into shadow roots, so the blocks must be looked up there.
function findMermaidBlock(id: string, outputItemId: string | undefined): HTMLElement | null {
    const owner = outputItemId ? document.getElementById(outputItemId) : null;
    const found = owner?.shadowRoot?.getElementById(id);
    if (found) {
        return found;
    }
    for (const element of Array.from(document.querySelectorAll('*'))) {
        const block = element.shadowRoot?.getElementById(id);
        if (block) {
            return block;
        }
    }
    return document.getElementById(id);
}

function mermaidPlugin(md: MarkdownIt): void {
    const pending: string[] = [];
    const fence = md.renderer.rules.fence;
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.info.trim() === 'mermaid') {
            const id = `preview-vscode-mermaid-block-${nextMermaidBlockId++}`;
            pending.push(id);
            return `<pre class="preview-vscode-mermaid" id="${id}">${md.utils.escapeHtml(token.content.trim())}</pre>`;
        }
        return fence ? fence(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
    };

    // The markdown-it renderer assigns the returned html to the cell synchronously,
    // so the blocks exist in the DOM by the time the microtask runs.
    const render = md.render;
    md.render = function (src: string, env?: { outputItem?: { id?: string } }): string {
        const html = render.call(this, src, env);
        const ids = pending.splice(0);
        if (ids.length > 0) {
            const outputItemId: string | undefined = env?.outputItem?.id;
            queueMicrotask(() => {
                const blocks = ids.map(id => findMermaidBlock(id, outputItemId)).filter((block): block is HTMLElement => !!block);
                // mermaid is loaded on demand, most cells have no diagrams.
                import('../preview/mermaid').then(({ renderMermaid }) => renderMermaid(blocks, mermaidTheme()));
            });
        }
        return html;
    };
}