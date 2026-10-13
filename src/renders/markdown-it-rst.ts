// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt from 'markdown-it';
import { RstToHtmlCompiler, type RstDirective, type RstGeneratorState, type RstNode } from 'rst-compiler';

function extendMarkdownIt(md: MarkdownIt): MarkdownIt {
    const config = vscode.workspace.getConfiguration('markdown',null);
    if (!config.get<boolean>('rst.enabled', true)) {
        return md;
    }
    return md.use(rst_render);
}

const rst_render = (md: MarkdownIt): void => {
    const temp = md.renderer.rules.fence?.bind(md.renderer.rules);
    md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];
        if (token.info === 'rst') {
            return `<div>${render(md, token.content)}</div>`;
        }
        if (temp) {
            return temp(tokens, idx, options, env, slf);
        }
        return `<pre>${token.content}</pre>`;// never be here
    };
};

function render(md: MarkdownIt, rst: string): string {
    try {
        const html = compiler(md).compile(rst, {}, { disableWarnings: true, disableErrors: true });
        return html.header + html.body;
    } catch (e) {
        const escape = md.utils.escapeHtml;
        return `<pre class="preview-vscode-error">${escape(String(e?.message ?? e))}</pre><pre>${escape(rst)}</pre>`;
    }
}

// rst-compiler throws on directives and roles it doesn't know, e.g. Sphinx's `toctree`, and on references
// it can't resolve, e.g. `:ref:` and `:doc:` to other documents. Show their source or text instead.
function compiler(md: MarkdownIt): RstToHtmlCompiler {
    const escape = md.utils.escapeHtml;
    const rst = new RstToHtmlCompiler();
    withFallback(rst.directiveGenerators, (state, node: RstDirective) => {
        const source = `.. ${node.directive}:: ${node.initContentText}`.trimEnd() + (node.rawBodyText ? `\n${node.rawBodyText}` : '');
        state.writeLineVisitor(() => state.writeText(`<pre class="preview-vscode-rst-directive">${escape(source)}</pre>`));
    });
    withFallback(rst.interpretedTextGenerators, (state, node: RstNode) => state.writeText(`<code>${escape(node.textContent)}</code>`));
    withFallback(rst.nodeGenerators, (state, node: RstNode) => state.writeText(escape(node.textContent)));
    return rst;
}

// A method signature, its parameters are bivariant, so generators of every node type fit.
type Generate = { generate(state: RstGeneratorState, node: RstNode): void }['generate'];

function withFallback<K>(generators: Map<K, { generate: Generate }>, fallback: Generate): void {
    const get = generators.get.bind(generators);
    generators.get = (key: K) => {
        const generator = get(key);
        return {
            ...generator,
            generate: (state: RstGeneratorState, node: RstNode) => {
                if (!generator) {
                    return fallback(state, node);
                }
                try {
                    generator.generate(state, node);
                } catch {
                    fallback(state, node);
                }
            },
        };
    };
}

export const MarkdownItRst = { extendMarkdownIt };
