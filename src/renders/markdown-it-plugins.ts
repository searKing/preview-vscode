// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt from 'markdown-it';
import abbr from 'markdown-it-abbr';
import anchor from 'markdown-it-anchor';
import attrs from 'markdown-it-attrs';
import bracketedSpans from 'markdown-it-bracketed-spans';
import cjkBreaks from 'markdown-it-cjk-breaks';
import deflist from 'markdown-it-deflist';
import { full as emoji } from 'markdown-it-emoji';
import expandTabs from 'markdown-it-expand-tabs';
import footnote from 'markdown-it-footnote';
import highlightjs from 'markdown-it-highlightjs';
import ins from 'markdown-it-ins';
import lazyHeaders from 'markdown-it-lazy-headers';
import mark from 'markdown-it-mark';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import { ExtendMarkdownIt } from './markdown-it';
import taskLists from './markdown-it-task-lists';

// Third-party markdown-it plugins that only need to be toggled and configured.
// `section` is the setting section, `markdown.<section>.enabled` toggles the plugin.
function simplePlugin<T>(
    section: string,
    plugin: MarkdownIt.PluginWithOptions<T>,
    options: (config: vscode.WorkspaceConfiguration) => T = () => ({}) as T,
): ExtendMarkdownIt {
    return (md) => {
        const config = vscode.workspace.getConfiguration(`markdown.${section}`, null);
        if (!config.get<boolean>('enabled', true)) {
            return md;
        }
        return md.use(plugin, options(config));
    };
}

export const MarkdownItAbbr = simplePlugin('abbr', abbr);

// its types are written against the ESM declarations of markdown-it, which don't match the CommonJS ones.
export const MarkdownItAnchor = simplePlugin('anchor', anchor as unknown as MarkdownIt.PluginWithOptions<anchor.AnchorOptions>, config => ({
    level: config.get<number>('level', 1),
}));

export const MarkdownItAttrs = simplePlugin('attrs', attrs, config => ({
    allowedAttributes: config.get<string[]>('allowedAttributes', []),
}));

export const MarkdownItBracketedSpans = simplePlugin('bracketed-spans', bracketedSpans);

export const MarkdownItCjkBreaks = simplePlugin('cjk-breaks', cjkBreaks);

export const MarkdownItDeflist = simplePlugin('deflist', deflist);

export const MarkdownItEmoji = simplePlugin('emoji', emoji);

export const MarkdownItExpandTabs = simplePlugin('expand-tabs', expandTabs, config => ({
    tabWidth: config.get<number>('tabWidth', 2),
}));

export const MarkdownItFootnote = simplePlugin('footnote', footnote);

export const MarkdownItHighlightjs = simplePlugin('highlightjs', highlightjs, config => ({
    auto: config.get<boolean>('auto', true),
    code: config.get<boolean>('code', true),
    inline: config.get<boolean>('inline', true),
    ignoreIllegals: config.get<boolean>('ignoreIllegals', true),
}));

export const MarkdownItIns = simplePlugin('ins', ins);

export const MarkdownItLazyHeaders = simplePlugin('lazy-headers', lazyHeaders);

export const MarkdownItMark = simplePlugin('mark', mark);

export const MarkdownItSub = simplePlugin('sub', sub);

export const MarkdownItSup = simplePlugin('sup', sup);

export const MarkdownItTaskLists = simplePlugin('tasklists', taskLists, config => ({
    enabled: config.get<boolean>('renderCheckboxes', true), // render checkboxes
    label: config.get<boolean>('label', true), // wrap the rendered list items in a <label> element for UX purposes
    labelAfter: config.get<boolean>('labelAfter', true), // add the <label> after the checkbox
}));
