// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MarkdownIt = require('markdown-it');
import { githubEngine } from './markdown-it-engine';

export type ExtendMarkdownIt = (context: vscode.ExtensionContext | undefined, md: MarkdownIt) => MarkdownIt;

export function join(fn: ExtendMarkdownIt, ...fns: ExtendMarkdownIt[]): ExtendMarkdownIt {
    if (fns.length === 0) {
        return fn;
    }
    if (fns.length === 1) {
        if (!fn) {
            return fns[0];
        }
        if (!fns[0]) {
            return fn;
        }
        return function (context: vscode.ExtensionContext | undefined, md: MarkdownIt): MarkdownIt {
            return fns[0](context, fn(context, md));
        };
    }
    return join(join(fn, fns[0]), ...fns.slice(1));
}

export async function markdown_render(text: string): Promise<string> {
    return await vscode.commands.executeCommand('markdown.api.render', text) as string;
}

export function await_markdown_render(text: string): string {
    return githubEngine.render(text)?.html; // markdown-it doesn't support async, so don't use embeded MarkdownRenderer. 

}

