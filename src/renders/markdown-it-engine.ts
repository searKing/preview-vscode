// Code borrowed from https://github.com/microsoft/vscode/blob/1.87.1/extensions/markdown-language-features/src/markdownEngine.ts
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');
import type Token = require('markdown-it/lib/token');

import { join } from './markdown-it';
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
import { githubSlugifier, Slugifier } from './slugify';
import { WebviewResourceProvider } from './util/resources';
import { isOfScheme, Schemes } from './util/schemes';
import { MarkdownItMarkdown } from './markdown-it-markdown';
import { MarkdownItHTML } from './markdown-it-html';
import { MarkdownItCjkBreaks } from './markdown-it-cjk-breaks';
import { MarkdownItBracketedSpans } from './markdown-it-bracketed-spans';
import { MarkdownItFencedFile } from './markdown-it-fenced-file';

export function extendMarkdownIt<T = any>(context: vscode.ExtensionContext | undefined, md: MarkdownIt, options?: T): MarkdownIt {
    return join(
        MarkdownItFencedFile.extendMarkdownIt,
        MarkdownItAbbr.extendMarkdownIt,
        MarkdownItAnchor.extendMarkdownIt,
        MarkdownItBracketedSpans.extendMarkdownIt,
        MarkdownItHighlightjs.extendMarkdownIt,
        MarkdownItAttrs.extendMarkdownIt,
        MarkdownItCjkBreaks.extendMarkdownIt,
        MarkdownItLazyHeaders.extendMarkdownIt,
        MarkdownItEmoji.extendMarkdownIt,
        MarkdownItTaskLists.extendMarkdownIt,
        MarkdownItExpandTabs.extendMarkdownIt,
        MarkdownItDeflist.extendMarkdownIt,
        MarkdownItFootnote.extendMarkdownIt,
        MarkdownItIns.extendMarkdownIt,
        MarkdownItMark.extendMarkdownIt,
        MarkdownItSub.extendMarkdownIt,
        MarkdownItSup.extendMarkdownIt,
        MarkdownItMermaid.extendMarkdownIt,
        MarkdownItPug.extendMarkdownIt,
        MarkdownItRst.extendMarkdownIt,
        MarkdownItMarkdown.extendMarkdownIt,
        MarkdownItHTML.extendMarkdownIt,
    )(context, md, options);
}

/**
 * Adds begin line index to the output via the 'data-line' data attribute.
 */
const pluginSourceMap: MarkdownIt.PluginSimple = (md: MarkdownIt): void => {
    // Set the attribute on every possible token.
    md.core.ruler.push('source_map_data_attribute', (state): void => {
        for (const token of state.tokens) {
            if (token.map && token.type !== 'inline') {
                token.attrSet('data-line', String(token.map[0]));
                token.attrJoin('class', 'code-line');
                token.attrJoin('dir', 'auto');
            }
        }
    });

    // The 'html_block' renderer doesn't respect `attrs`. We need to insert a marker.
    const originalHtmlBlockRenderer = md.renderer.rules['html_block'];
    if (originalHtmlBlockRenderer) {
        md.renderer.rules['html_block'] = (tokens, idx, options, env, self) => (
            `<div ${self.renderAttrs(tokens[idx])} ></div>\n` +
            originalHtmlBlockRenderer(tokens, idx, options, env, self)
        );
    }
};


/**
 * The markdown-it options that we expose in the settings.
 */
type MarkdownItConfig = MarkdownIt.Options;

type RenderEnv = any;

export interface RenderOutput {
    html: string;
    containingImages: Set<string>;
}

class MarkdownItEngine {
    private _md: MarkdownIt | undefined;

    private _slugCount = new Map<string, number>();

    public readonly slugifier: Slugifier;

    public constructor(slugifier: Slugifier = githubSlugifier) {
        this.slugifier = slugifier;
    }

    public getEngine(resource: vscode.Uri | undefined): MarkdownIt {
        const config = this._getConfig(resource);
        return this._getEngine(config);
    }

    private _getEngine(config: MarkdownItConfig): MarkdownIt {
        if (!this._md) {
            this._md = ((): MarkdownIt => {
                const markdownIt = require('markdown-it');
                let md: MarkdownIt = markdownIt(getMarkdownOptions(() => md));
                md.linkify.set({ fuzzyLink: false });
                extendMarkdownIt(undefined, md);

                const frontMatterPlugin = require('markdown-it-front-matter');
                // Extract rules from front matter plugin and apply at a lower precedence
                let fontMatterRule: any;
                frontMatterPlugin({
                    block: {
                        ruler: {
                            before: (_id: any, _id2: any, rule: any) => { fontMatterRule = rule; }
                        }
                    }
                }, () => { /* noop */ });

                md.block.ruler.before('fence', 'front_matter', fontMatterRule, {
                    alt: ['paragraph', 'reference', 'blockquote', 'list']
                });
                this._addImageRenderer(md);
                this._addFencedRenderer(md);
                this._addLinkNormalizer(md);
                this._addLinkValidator(md);
                this._addNamedHeaders(md);
                this._addLinkRenderer(md);
                md.use(pluginSourceMap);
                return md;
            })();
        }

        const md = this._md!;
        md.set(config);
        return md;
    }

    public reloadPlugins() {
        this._md = undefined;
    }

    private _tokenizeString(text: string, engine: MarkdownIt) {
        this._resetSlugCount();

        return engine.parse(text, {});
    }

    private _resetSlugCount(): void {
        this._slugCount = new Map<string, number>();
    }

    public render(input: string, resourceProvider?: WebviewResourceProvider): RenderOutput {
        const config = this._getConfig(undefined);
        const engine = this._getEngine(config);

        const tokens = this._tokenizeString(input, engine);

        const env: RenderEnv = {
            containingImages: new Set<string>(),
            resourceProvider,
        };

        const html = engine.renderer.render(tokens, {
            ...engine.options,
            ...config
        }, env);

        return {
            html,
            containingImages: env.containingImages
        };
    }

    private _getConfig(resource?: vscode.Uri): MarkdownItConfig {
        const markdownConfig = vscode.workspace.getConfiguration('markdown', resource ?? null);
        return {
            breaks: !!markdownConfig.get<boolean>('preview.breaks', false),
            linkify: !!markdownConfig.get<boolean>('preview.linkify', true),
            typographer: !!markdownConfig.get<boolean>('preview.typographer', false),
        };
    }

    private _addImageRenderer(md: MarkdownIt): void {
        const original = md.renderer.rules.image;
        md.renderer.rules.image = (tokens: Token[], idx: number, options, env: RenderEnv, self) => {
            const token = tokens[idx];
            const src = token.attrGet('src');
            if (src) {
                env.containingImages?.add(src);

                if (!token.attrGet('data-src')) {
                    token.attrSet('src', this._toResourceUri(src, env.currentDocument, env.resourceProvider));
                    token.attrSet('data-src', src);
                }
            }

            if (original) {
                return original(tokens, idx, options, env, self);
            } else {
                return self.renderToken(tokens, idx, options);
            }
        };
    }

    private _addFencedRenderer(md: MarkdownIt): void {
        const original = md.renderer.rules['fenced'];
        md.renderer.rules['fenced'] = (tokens: Token[], idx: number, options, env, self) => {
            const token = tokens[idx];
            if (token.map?.length) {
                token.attrJoin('class', 'hljs');
            }

            if (original) {
                return original(tokens, idx, options, env, self);
            } else {
                return self.renderToken(tokens, idx, options);
            }
        };
    }

    private _addLinkNormalizer(md: MarkdownIt): void {
        const normalizeLink = md.normalizeLink;
        md.normalizeLink = (link: string) => {
            try {
                // Normalize VS Code schemes to target the current version
                if (isOfScheme(Schemes.vscode, link) || isOfScheme(Schemes['vscode-insiders'], link)) {
                    return normalizeLink(vscode.Uri.parse(link).with({ scheme: vscode.env.uriScheme }).toString());
                }

            } catch (e) {
                // noop
            }
            return normalizeLink(link);
        };
    }

    private _addLinkValidator(md: MarkdownIt): void {
        const validateLink = md.validateLink;
        md.validateLink = (link: string) => {
            return validateLink(link)
                || isOfScheme(Schemes.vscode, link)
                || isOfScheme(Schemes['vscode-insiders'], link)
                || /^data:image\/.*?;/.test(link);
        };
    }

    private _addNamedHeaders(md: MarkdownIt): void {
        const original = md.renderer.rules.heading_open;
        md.renderer.rules.heading_open = (tokens: Token[], idx: number, options, env, self) => {
            const title = tokens[idx + 1].children!.reduce<string>((acc, t) => acc + t.content, '');
            let slug = this.slugifier.fromHeading(title);

            if (this._slugCount.has(slug.value)) {
                const count = this._slugCount.get(slug.value)!;
                this._slugCount.set(slug.value, count + 1);
                slug = this.slugifier.fromHeading(slug.value + '-' + (count + 1));
            } else {
                this._slugCount.set(slug.value, 0);
            }

            tokens[idx].attrSet('id', slug.value);

            if (original) {
                return original(tokens, idx, options, env, self);
            } else {
                return self.renderToken(tokens, idx, options);
            }
        };
    }

    private _addLinkRenderer(md: MarkdownIt): void {
        const original = md.renderer.rules.link_open;

        md.renderer.rules.link_open = (tokens: Token[], idx: number, options, env, self) => {
            const token = tokens[idx];
            const href = token.attrGet('href');
            // A string, including empty string, may be `href`.
            if (typeof href === 'string') {
                token.attrSet('data-href', href);
            }
            if (original) {
                return original(tokens, idx, options, env, self);
            } else {
                return self.renderToken(tokens, idx, options);
            }
        };
    }

    private _toResourceUri(href: string, currentDocument: vscode.Uri | undefined, resourceProvider: WebviewResourceProvider | undefined): string {
        try {
            // Support file:// links
            if (isOfScheme(Schemes.file, href)) {
                const uri = vscode.Uri.parse(href);
                if (resourceProvider) {
                    return resourceProvider.asWebviewUri(uri).toString(true);
                }
                // Not sure how to resolve this
                return href;
            }

            // If original link doesn't look like a url with a scheme, assume it must be a link to a file in workspace
            if (!/^[a-z\-]+:/i.test(href)) {
                // Use a fake scheme for parsing
                let uri = vscode.Uri.parse('markdown-link:' + href);

                // Relative paths should be resolved correctly inside the preview but we need to
                // handle absolute paths specially to resolve them relative to the workspace root
                if (uri.path[0] === '/' && currentDocument) {
                    const root = vscode.workspace.getWorkspaceFolder(currentDocument);
                    if (root) {
                        uri = vscode.Uri.joinPath(root.uri, uri.fsPath).with({
                            fragment: uri.fragment,
                            query: uri.query,
                        });

                        if (resourceProvider) {
                            return resourceProvider.asWebviewUri(uri).toString(true);
                        } else {
                            uri = uri.with({ scheme: 'markdown-link' });
                        }
                    }
                }

                return uri.toString(true).replace(/^markdown-link:/, '');
            }

            return href;
        } catch {
            return href;
        }
    }
}

function getMarkdownOptions(md: () => MarkdownIt): MarkdownIt.Options {
    const hljs = require('highlight.js').default;
    return {
        html: true,
        highlight: (str: string, lang?: string) => {
            lang = normalizeHighlightLang(lang);
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(str, {
                        language: lang,
                        ignoreIllegals: true,
                    }).value;
                }
                catch (error) { }
            }
            return md().utils.escapeHtml(str);
        }
    };
}

function normalizeHighlightLang(lang: string | undefined) {
    switch (lang && lang.toLowerCase()) {
        case 'shell':
            return 'sh';

        case 'py3':
            return 'python';

        case 'tsx':
        case 'typescriptreact':
            // Workaround for highlight not supporting tsx: https://github.com/isagalaev/highlight.js/issues/1155
            return 'jsx';

        case 'json5':
        case 'jsonc':
            return 'json';

        case 'c#':
        case 'csharp':
            return 'cs';

        default:
            return lang;
    }
}

export const githubEngine: MarkdownItEngine = new MarkdownItEngine(githubSlugifier);

