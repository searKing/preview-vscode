/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import type MarkdownIt = require('markdown-it');
import type { RendererContext } from 'vscode-notebook-renderer';

interface MarkdownItRenderer {
    extendMarkdownIt(fn: (md: MarkdownIt) => void): void;
}

const styleHref = import.meta.url.replace(/index.js$/, 'index.min.css');

const regex_mermaid = new RegExp(/^mermaid(\s+(.*)|)$/);

function mermaid_render(tokens, idx): string {
    // console.log('tokens = ' + JSON.stringify(tokens[idx]));
    var m = tokens[idx].info.trim().match(regex_mermaid);

    if (tokens[idx].nesting === 1) {
        const token = tokens[idx];
        // opening tag
        // return '<details><summary>' + md.utils.escapeHtml(m[1]) + '</summary>\n';
        let mermaidContent = tokens[idx].content;
        for (let index = idx; index < tokens.length; index++) {
            const token = tokens[index];
            if (token.type === "inline" || token.type === "code_block") {
                mermaidContent = token.content;
                break;
            }
        }
        // Every Mermaid chart/graph/diagram definition should have separate <pre> tags.
        // https://mermaid.js.org/intro/getting-started.html#examples
        return `<hr>
<pre class="mermaid">
	${mermaidContent.trim()}
</pre>
<!--`;
    } else {
        // closing tag
        return '-->\n';
    }
}

export async function activate(ctx: RendererContext<void>) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your renderer "preview-vscode" is now active!');

    const markdownItRenderer = await ctx.getRenderer('vscode.markdown-it-renderer') as MarkdownItRenderer | undefined;
    if (!markdownItRenderer) {
        throw new Error(`Could not load 'vscode.markdown-it-renderer'`);
    }

    // Add notebook styles to be copied to shadow dom
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.classList.add('markdown-style');
    link.href = styleHref;

    // Add same notebook style to root document.
    // This is needed for the font to be loaded correctly inside the shadow dom.
    //
    // Seems like https://bugs.chromium.org/p/chromium/issues/detail?id=336876
    const linkHead = document.createElement('link');
    linkHead.rel = 'stylesheet';
    linkHead.href = styleHref;
    document.head.appendChild(linkHead);
    // { // mermaid
    // 	const scriptHead = document.createElement('script');
    // 	scriptHead.src = mermaidSrc;
    // 	scriptHead.type = 'text/javascript';
    // 	scriptHead.text = 'mermaid.initialize({startOnLoad: true, theme: "forest"});';
    // 	document.head.appendChild(scriptHead);
    // }
    { // mermaid
        const scriptHead = document.createElement('script');
        // scriptHead.src = mermaidSrc;
        scriptHead.type = 'module';
        scriptHead.text = `import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
		mermaid.initialize({ startOnLoad: true });`;
        document.head.appendChild(scriptHead);
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
    styleTemplate.content.appendChild(link);
    document.head.appendChild(styleTemplate);

    markdownItRenderer.extendMarkdownIt((md: MarkdownIt) => {
        return md.use(require("markdown-it-abbr"), {}).use(require("markdown-it-anchor").default, {}).use(require("markdown-it-bracketed-spans"), {}).use(require("markdown-it-attrs"), {}).use(require("markdown-it-cjk-breaks"), {}).use(require("markdown-it-deflist"), {}).use(require('markdown-it-emoji').full, { shortcuts: {} }).use(require("markdown-it-expand-tabs"), { tabWidth: 2 }).use(require("markdown-it-footnote"), {}).use(require("markdown-it-highlightjs"), {}).use(require("markdown-it-ins"), {}).use(require("markdown-it-lazy-headers"), {}).use(require("markdown-it-mark"), {}).use(require("markdown-it-sub"), {}).use(require("markdown-it-sup"), {}).use(require('markdown-it-task-lists'), {
            enabled: true, // render checkboxes
            label: true, // wrap the rendered list items in a <label> element for UX purposes
            labelAfter: false // add the <label> after the checkbox
        });
    });
}