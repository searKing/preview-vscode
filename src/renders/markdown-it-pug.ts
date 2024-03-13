// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');
import { dedent } from 'ts-dedent';
import path from 'path';
import fs from 'fs';

export namespace MarkdownItPug {
    const markdownPugSetting = 'markdown.pug';

    const get_pug_package = (): string => {
        var pug_package = path.resolve(path.dirname(require.resolve("pug/package.json")));
        if (fs.existsSync(pug_package)) {
            return pug_package;
        }
        // https://pugjs.org/js/pug.js
        return 'https://cdn.jsdelivr.net/npm/pug@3';
    };

    const pug_package = get_pug_package();

    // This method is called when your extension is activated
    // Your extension is activated the very first time the command is executed
    export function extendMarkdownIt(context: vscode.ExtensionContext | undefined, md: MarkdownIt): MarkdownIt {
        function isEnabled(): boolean {
            const config = vscode.workspace.getConfiguration('markdown');
            return config.get<boolean>('pug.enabled', true);
        }

        if (!!context) {
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(markdownPugSetting)) {
                    vscode.commands.executeCommand('markdown.api.reloadPlugins');
                }
            }, undefined, context.subscriptions);
        }
        if (!isEnabled()) {
            return md;
        }
        try {
            var pug = require('pug');
        } catch (error) {
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
                    let dedent_code = dedent(require('entity-decode')(code)) // removes indentation, required for YAML parsing
                        .trim()
                        .replace(/<br\s*\/?>/gi, '<br/>');

                    if (!!pug && !!pug.compile) {
                        const html = pug.compile(dedent_code);
                        return `<div>${html}</div>`;
                    }
                    return `<script src="https://pugjs.org/js/pug.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', init, false);
        function init() {
            pug = require('pug');
            $pug = document.querySelector('.pug');
            // console.log('Ready');
            nodesToProcess = document.querySelectorAll('.pug');
            // console.log(\`Found \${nodesToProcess.length} diagrams\`);
            let txt = '';
            const errors = [];
            // element is the current div with mermaid class
            // eslint-disable-next-line unicorn/prefer-spread
            for (const element of Array.from(nodesToProcess)) {
                // console.log('Rendering diagram: ' + element.id);
                /*! Check if previously processed */
                if (element.getAttribute('data-processed')) {
                    continue;
                }
                element.setAttribute('data-processed', 'true');
    
                // Fetch the graph definition including tags
                txt = element.innerHTML;
                txt = txt.trim();
                try {
                    element.innerHTML = pug.render(txt).trim();
                } catch (error) {
                    console.error(\`parse pug[\${element.id}] failed \${error}\`)
                    errors.push(error)
                }
            }
            if (errors.length > 0) {
                // TODO: We should be throwing an error object.
                throw errors[0];
            }
        }
    </script>
    <pre class="pug">${dedent_code}</pre>`;
                }
                if (!!temp) {
                    return temp(tokens, idx, options, env, slf);
                }
                return `<pre>${code}</pre>`;// never be here
            };
        };
    };
}