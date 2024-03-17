// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MarkdownIt = require('markdown-it');
import { dedent } from 'ts-dedent';
import path from 'path';
import fs from 'fs';

export namespace MarkdownItMermaid {
    const markdownMermaidSetting = 'markdown.mermaid';

    const get_mermaid_package = (): string => {
        // var mermaid_package = path.resolve(path.dirname(require.resolve("mermaid/package.json")));
        const REPO_ROOT = path.normalize(path.join(__dirname, '../../'));
        let mermaid_package = path.join(REPO_ROOT, require.resolve("mermaid/package.json"), "../dist/mermaid.esm.min.mjs");
        if (fs.existsSync(mermaid_package)) {
            return `${mermaid_package}`;
        }
        return 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    };

    const mermaid_package = get_mermaid_package();

    // This method is called when your extension is activated
    // Your extension is activated the very first time the command is executed
    export function extendMarkdownIt(context: vscode.ExtensionContext | undefined, md: MarkdownIt): MarkdownIt {
        if (!!context) {
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(markdownMermaidSetting)) {
                    vscode.commands.executeCommand('markdown.api.reloadPlugins');
                }
            }, undefined, context.subscriptions);
        }

        const config = vscode.workspace.getConfiguration('markdown');
        if (!config.get<boolean>('mermaid.enabled', true)) {
            return md;
        }
        return md.use(mermaid_render, {});
    }

    const mermaid_render = (md: MarkdownIt): void => {
        const temp = md.renderer.rules.fence?.bind(md.renderer.rules);
        md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
            const token = tokens[idx];
            const code = token.content.trim();
            if (token.info === 'mermaid') {
                // https://github.com/mermaid-js/mermaid/blob/579f1f9dc156dd72326efdb3880a351a3dee96a1/packages/mermaid/src/mermaid.ts#L162
                // transforms the html to pure text
                let dedent_code = dedent(require('entity-decode')(code)) // removes indentation, required for YAML parsing
                    .trim()
                    .replace(/<br\s*\/?>/gi, '<br/>');

                // Every Mermaid chart/graph/diagram definition should have separate <pre> tags.
                // https://mermaid.js.org/intro/getting-started.html#examples
                return `<script type="module">
import mermaid from '${mermaid_package}';
mermaid.initialize({ startOnLoad: true });
</script>
<pre class="mermaid">${dedent_code}</pre>`;
            }
            if (!!temp) {
                return temp(tokens, idx, options, env, slf);
            }
            return `<pre>${code}</pre>`;// never be here
        };
    };
}