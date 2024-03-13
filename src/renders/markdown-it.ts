// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MarkdownIt = require('markdown-it');
import { MarkdownItLazyHeaders } from './markdown-it-lazy-headers';
import { MarkdownItEmoji } from './markdown-it-emoji';
import { MarkdownItTaskLists } from './markdown-it-task-lists';
import { MarkdownItExpandTabs } from './markdown-it-expand-tabs';
import { MarkdownItAbbr } from './markdown-it-abbr';
import { MarkdownItAnchor } from './markdown-it-anchor';
import { MarkdownItAttrs } from './markdown-it-attrs';
import { MarkdownItDeflist } from './markdown-it-deflist';
import { MarkdownItFootnote } from './markdown-it-footnote';
import { MarkdownItHighlightjs } from './markdown-it-highlightjs';
import { MarkdownItIns } from './markdown-it-ins';
import { MarkdownItMark } from './markdown-it-mark';
import { MarkdownItSub } from './markdown-it-sub';
import { MarkdownItSup } from './markdown-it-sup';
import { MarkdownItMermaid } from './markdown-it-mermaid';
import { MarkdownItPug } from './markdown-it-pug';
import { MarkdownItRst } from './markdown-it-rst';
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

