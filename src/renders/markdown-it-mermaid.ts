// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt from 'markdown-it';
import entityDecode from 'entity-decode';
import { dedent } from 'ts-dedent';

// The "auto" theme follows the color theme, the plugins are reloaded when it changes.
function extendMarkdownIt(md: MarkdownIt): MarkdownIt {
    const config = vscode.workspace.getConfiguration('markdown', null);
    if (!config.get<boolean>('mermaid.enabled', true)) {
        return md;
    }

    let theme = config.get<string>('mermaid.theme', "auto");
    if (theme === "auto") {
        // https://mermaid.js.org/config/schema-docs/config.html#theme
        // "default" | "forest" | "dark" | "neutral" | "null"
        switch (vscode.window.activeColorTheme.kind) {
            case vscode.ColorThemeKind.Light:
                theme = "default";
                break;
            case vscode.ColorThemeKind.Dark:
                theme = "dark";
                break;
            case vscode.ColorThemeKind.HighContrastLight:
                theme = "forest";
                break;
            case vscode.ColorThemeKind.HighContrast:
                theme = "neutral";
                break;
            default:
                theme = "default";
                break;
        }
    }
    return md.use(mermaid_render, theme);
}

// Rendered into SVG by the preview script, see src/preview/index.ts.
const mermaid_render = (md: MarkdownIt, theme: string): void => {
    const temp = md.renderer.rules.fence?.bind(md.renderer.rules);
    md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];
        const code = token.content.trim();
        if (token.info === 'mermaid') {
            // https://github.com/mermaid-js/mermaid/blob/579f1f9dc156dd72326efdb3880a351a3dee96a1/packages/mermaid/src/mermaid.ts#L162
            // transforms the html to pure text
            const dedent_code = dedent(entityDecode(code)) // removes indentation, required for Markdown parsing
                .trim()
                .replace(/<br\s*\/?>/gi, '<br/>');

            // Every Mermaid chart/graph/diagram definition should have separate <pre> tags.
            // https://mermaid.js.org/intro/getting-started.html#examples
            // Not `mermaid`: VS Code's builtin mermaid extension re-renders every `.mermaid` element.
            return `<pre class="preview-vscode-mermaid" data-theme="${md.utils.escapeHtml(theme)}">${md.utils.escapeHtml(dedent_code)}</pre>`;
        }
        if (temp) {
            return `${temp(tokens, idx, options, env, slf)}`;
        }
        return `<pre>${code}</pre>`;// never be here
    };
};

export const MarkdownItMermaid = { extendMarkdownIt };
