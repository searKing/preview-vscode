// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MarkdownIt = require('markdown-it');
import { dedent } from 'ts-dedent';
import path from 'path';
import fs from 'fs';
import { githubEngine } from './markdown-it-engine';

export namespace MarkdownItMarkdown {
    const markdownMarkdownSetting = 'markdown.markdown';

    // This method is called when your extension is activated
    // Your extension is activated the very first time the command is executed
    export function extendMarkdownIt(context: vscode.ExtensionContext | undefined, md: MarkdownIt): MarkdownIt {
        function isEnabled(): boolean {
            const config = vscode.workspace.getConfiguration('markdown');
            return config.get<boolean>('markdown.enabled', true);
        }

        if (!!context) {
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(markdownMarkdownSetting)) {
                    vscode.commands.executeCommand('markdown.api.reloadPlugins');
                }
            }, undefined, context.subscriptions);
        }
        if (!isEnabled()) {
            return md;
        }
        return md.use(markdown_render, {});
    }

    const markdown_render = (md: MarkdownIt): void => {
        const temp = md.renderer.rules.fence?.bind(md.renderer.rules);
        md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
            const token = tokens[idx];
            const code = token.content.trim();
            if (token.info === 'md') {
                // https://github.com/mermaid-js/mermaid/blob/579f1f9dc156dd72326efdb3880a351a3dee96a1/packages/mermaid/src/mermaid.ts#L162
                // transforms the html to pure text
                let dedent_code = dedent(require('entity-decode')(code)) // removes indentation, required for YAML parsing
                    .trim()
                    .replace(/<br\s*\/?>/gi, '<br/>');

                const html = githubEngine.render(dedent_code)?.html; // markdown-it doesn't support async, so don't use embeded MarkdownRenderer. 
                return `<div>${html}</div>`;
            }
            if (!!temp) {
                return temp(tokens, idx, options, env, slf);
            }
            return `<pre>${code}</pre>`;// never be here
        };
    };
}