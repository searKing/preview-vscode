// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');
import { ExtendMarkdownIt } from './markdown-it';

// Third-party markdown-it plugins that only need to be toggled and configured.
// `section` is the setting section, `markdown.<section>.enabled` toggles the plugin.
function simplePlugin(
    section: string,
    load: () => MarkdownIt.PluginWithOptions<any>,
    options: (config: vscode.WorkspaceConfiguration) => any = () => ({}),
): ExtendMarkdownIt {
    return (md) => {
        const config = vscode.workspace.getConfiguration(`markdown.${section}`, null);
        if (!config.get<boolean>('enabled', true)) {
            return md;
        }
        return md.use(load(), options(config));
    };
}

export const MarkdownItAbbr = simplePlugin('abbr', () => require('markdown-it-abbr'));

export const MarkdownItAnchor = simplePlugin('anchor', () => require('markdown-it-anchor').default, config => ({
    level: config.get<number>('level', 1),
}));

export const MarkdownItAttrs = simplePlugin('attrs', () => require('markdown-it-attrs'), config => ({
    allowedAttributes: config.get<string[]>('allowedAttributes', []),
}));

export const MarkdownItBracketedSpans = simplePlugin('bracketed-spans', () => require('markdown-it-bracketed-spans'));

// TODO: revert to markdown-it-cjk-breaks when https://github.com/markdown-it/markdown-it-cjk-breaks/pull/5 is fixed
export const MarkdownItCjkBreaks = simplePlugin('cjk-breaks', () => require('@searking/markdown-it-cjk-breaks'));

export const MarkdownItDeflist = simplePlugin('deflist', () => require('markdown-it-deflist'));

export const MarkdownItEmoji = simplePlugin('emoji', () => require('markdown-it-emoji').full);

export const MarkdownItExpandTabs = simplePlugin('expand-tabs', () => require('markdown-it-expand-tabs'), config => ({
    tabWidth: config.get<number>('tabWidth', 2),
}));

export const MarkdownItFootnote = simplePlugin('footnote', () => require('markdown-it-footnote'));

export const MarkdownItHighlightjs = simplePlugin('highlightjs', () => require('markdown-it-highlightjs'), config => ({
    auto: config.get<boolean>('auto', true),
    code: config.get<boolean>('code', true),
    inline: config.get<boolean>('inline', true),
    ignoreIllegals: config.get<boolean>('ignoreIllegals', true),
}));

export const MarkdownItIns = simplePlugin('ins', () => require('markdown-it-ins'));

export const MarkdownItLazyHeaders = simplePlugin('lazy-headers', () => require('markdown-it-lazy-headers'));

export const MarkdownItMark = simplePlugin('mark', () => require('markdown-it-mark'));

export const MarkdownItSub = simplePlugin('sub', () => require('markdown-it-sub'));

export const MarkdownItSup = simplePlugin('sup', () => require('markdown-it-sup'));

export const MarkdownItTaskLists = simplePlugin('tasklists', () => require('markdown-it-task-lists'), config => ({
    enabled: config.get<boolean>('renderCheckboxes', true), // render checkboxes
    label: config.get<boolean>('label', true), // wrap the rendered list items in a <label> element for UX purposes
    labelAfter: config.get<boolean>('labelAfter', true), // add the <label> after the checkbox
}));
