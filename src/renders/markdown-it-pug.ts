// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');
import { dedent } from 'ts-dedent';

export namespace MarkdownItPug {
    export function extendMarkdownIt(md: MarkdownIt): MarkdownIt {
        const config = vscode.workspace.getConfiguration('markdown', null);
        if (!config.get<boolean>('pug.enabled', true)) {
            return md;
        }
        let pug = undefined;
        try {
            pug = require('pug');
        } catch (error) {
            // import pug failed: TypeError: Unable to determine current node version
            // pug -> resolve -> is-core-module
            // support Node only, not support Browser.
            console.log(`import pug ignored: ${error}, support Node only`);
        }
        return md.use(pug_render(pug), {});
    }

    const pug_render = (pug: any): MarkdownIt.PluginSimple => {
        return (md: MarkdownIt): void => {
            const temp = md.renderer.rules.fence?.bind(md.renderer.rules);
            md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
                const token = tokens[idx];
                const code = token.content.trim();
                if (token.info === 'pug' || token.info === 'jade') {
                    // https://github.com/mermaid-js/mermaid/blob/579f1f9dc156dd72326efdb3880a351a3dee96a1/packages/mermaid/src/mermaid.ts#L162
                    // transforms the html to pure text
                    let dedent_code = dedent(require('entity-decode')(code)) // removes indentation, required for Markdown parsing
                        .trim()
                        .replace(/<br\s*\/?>/gi, '<br/>');

                    if (!!pug && !!pug.render) {
                        try {
                            return `<div>${pug.render(dedent_code)}</div>`;
                        } catch (error) {
                            return `<pre class="pug preview-vscode-error">${md.utils.escapeHtml(`${error}`)}</pre>`;
                        }
                    }
                    // pug is unavailable in the browser (web extension), show the source instead.
                    return `<pre class="pug">${md.utils.escapeHtml(dedent_code)}</pre>`;
                }
                if (!!temp) {
                    return temp(tokens, idx, options, env, slf);
                }
                return `<pre>${code}</pre>`;// never be here
            };
        };
    };
}
