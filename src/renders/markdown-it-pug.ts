// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');
import { dedent } from 'ts-dedent';

export namespace MarkdownItPug {
    const markdownPugSetting = 'markdown.pug';

    const get_pug_package = (): string => {
        /*
        // var pug_package = path.resolve(path.dirname(require.resolve("pug/package.json")));

        // TODO: pug doesn't render if use npm/pug@3/lib/index.min.js
        // Uncaught ReferenceError: require is not defined
        // https://github.com/PythonLinks/pug/blob/master/README.md#installation-on-the-client
        // https://github.com/pugjs/pug/issues/3094s
        const REPO_ROOT = path.normalize(path.join(__dirname, '../../'));
        let pug_package = path.join(REPO_ROOT, require.resolve("pug/package.json"), "../lib/index.js");
        if (fs.existsSync(pug_package)) {
            return `${pug_package}`;
        }
        return 'https://cdn.jsdelivr.net/npm/pug@3/lib/index.min.js';
        */
        return 'https://pugjs.org/js/pug.js';
    };

    const pug_package = get_pug_package();

    // This method is called when your extension is activated
    // Your extension is activated the very first time the command is executed
    export function extendMarkdownIt(context: vscode.ExtensionContext | undefined, md: MarkdownIt): MarkdownIt {
        if (!!context) {
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(markdownPugSetting)) {
                    vscode.commands.executeCommand('markdown.api.reloadPlugins');
                }
            }, undefined, context.subscriptions);
        }

        const config = vscode.workspace.getConfiguration('markdown',null);
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
                    let dedent_code = dedent(require('entity-decode')(code)) // removes indentation, required for YAML parsing
                        .trim()
                        .replace(/<br\s*\/?>/gi, '<br/>');

                    // TODO: require('pug') returns {}, so use <script> instead for trick.
                    // WARNING in ./node_modules/pug-filters/lib/run-filter.js 33:25-40
                    // Critical dependency: the request of a dependency is an expression
                    if (!!pug && !!pug.compile) {
                        const html = pug.compile(dedent_code);
                        return `<div>${html}</div>`;
                    }
                    return `<script src="${pug_package}"></script>
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