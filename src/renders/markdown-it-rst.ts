// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');
import { dedent } from 'ts-dedent';
import { githubEngine } from './markdown-it-engine';

export namespace MarkdownItRst {
    const markdownRstSetting = 'markdown.rst';

    // This method is called when your extension is activated
    // Your extension is activated the very first time the command is executed
    export function extendMarkdownIt(context: vscode.ExtensionContext | undefined, md: MarkdownIt): MarkdownIt {
        if (!!context) {
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(markdownRstSetting)) {
                    vscode.commands.executeCommand('markdown.api.reloadPlugins');
                }
            }, undefined, context.subscriptions);
        }

        const config = vscode.workspace.getConfiguration('markdown');
        if (!config.get<boolean>('rst.enabled', true)) {
            return md;
        }
        var rst = require('rst2mdown');
        return md.use(rst_render(rst), {});
    }

    const rst_render = (rst: any): MarkdownIt.PluginSimple => {
        return (md: MarkdownIt): void => {
            const temp = md.renderer.rules.fence?.bind(md.renderer.rules);
            md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
                const token = tokens[idx];
                const code = token.content.trim();
                if (token.info === 'rst') {
                    // https://github.com/mermaid-js/mermaid/blob/579f1f9dc156dd72326efdb3880a351a3dee96a1/packages/mermaid/src/mermaid.ts#L162
                    // transforms the html to pure text
                    let dedent_code = dedent(require('entity-decode')(code)) // removes indentation, required for YAML parsing
                        .trim()
                        .replace(/<br\s*\/?>/gi, '<br/>');

                    if (!!rst) {
                        const markdown = rst(dedent_code);
                        const html = githubEngine.render(markdown)?.html; // markdown-it doesn't support async, so don't use embeded MarkdownRenderer. 
                        return `<div>${html}</div>`;
                    }
                }
                if (!!temp) {
                    return temp(tokens, idx, options, env, slf);
                }
                return `<pre>${code}</pre>`;// never be here
            };
        };
    };
}