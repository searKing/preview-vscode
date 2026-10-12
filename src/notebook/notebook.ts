/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import type MarkdownIt = require('markdown-it');
import type { RendererContext } from 'vscode-notebook-renderer';
import { renderMermaid } from '../preview/mermaid';

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
	`;

    // Put Everything into a template
    const styleTemplate = document.createElement('template');
    styleTemplate.classList.add('markdown-style');
    styleTemplate.content.appendChild(style);
    document.head.appendChild(styleTemplate);

    markdownItRenderer.extendMarkdownIt((md: MarkdownIt) => {
        return md.use(require("markdown-it-abbr"), {}).
            use(require("markdown-it-anchor").default, {}).
            use(require("markdown-it-bracketed-spans"), {}).
            use(require("markdown-it-highlightjs"), {}).
            use(require("markdown-it-attrs"), {}).
            use(require("@searking/markdown-it-cjk-breaks"), {}). // TODO: revert to markdown-it-cjk-breaks when https://github.com/markdown-it/markdown-it-cjk-breaks/pull/5 is fixed
            use(require("markdown-it-deflist"), {}).
            use(require('markdown-it-emoji').full, { shortcuts: {} }).
            use(require("markdown-it-expand-tabs"), { tabWidth: 2 }).
            use(require("markdown-it-footnote"), {}).
            use(require("markdown-it-ins"), {}).
            use(require("markdown-it-lazy-headers"), {}).
            use(require("markdown-it-mark"), {}).
            use(require("markdown-it-sub"), {}).
            use(require("markdown-it-sup"), {}).
            use(require('markdown-it-task-lists'), {
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
    md.render = function (src: string, env?: any): string {
        const html = render.call(this, src, env);
        const ids = pending.splice(0);
        if (ids.length > 0) {
            const outputItemId: string | undefined = env?.outputItem?.id;
            queueMicrotask(() => {
                const blocks = ids.map(id => findMermaidBlock(id, outputItemId)).filter((block): block is HTMLElement => !!block);
                renderMermaid(blocks, mermaidTheme());
            });
        }
        return html;
    };
}