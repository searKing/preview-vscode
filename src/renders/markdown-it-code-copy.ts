// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');
import { dedent } from 'ts-dedent';


export namespace MarkdownItCodeCopy {
    const markdownCodeCopySetting = 'markdown-it-code-copy';

    const get_clipboardjs_package = (): string => {
        // https://github.com/zenorocha/clipboard.js/wiki/CDN-Providers
        return 'https://unpkg.com/@github/clipboard-copy-element@latest';
    };

    const get_clipboardjs_header = (): string => `<script type="module" src="${get_clipboardjs_package()}"></script>
<style>
    clipboard-copy {
    -webkit-appearance: button;
    -moz-appearance: button;
    appearance: button;
    /* padding: 0.4em 0.6em; */
    font: 0.9rem system-ui, sans-serif;
    display: inline-block;
    cursor: default;
    color: rgb(36, 41, 47);
    background: rgb(246, 248, 250);
    border-radius: 6px;
    border: 1px solid rgba(31, 35, 40, 0.15);
    box-shadow: rgba(31, 35, 40, 0.04) 0 1px 0 0, rgba(255, 255, 255, 0.25) 0 1 0 0 inset;
    }
            
    clipboard-copy:hover {
    background: rgb(243, 244, 246);
    }
            
    clipboard-copy:active {
    background: #ebecf0;
    }
            
    clipboard-copy:focus-visible {
    outline: 2px solid #0969da;
    }
            
    .btn .octicon {
    margin-right: 4px;
    color: var(--fgColor-muted, var(--color-fg-muted));
    vertical-align: text-bottom;
    }
            
    .d-none {
    display: none !important;
    }
            
    .position-relative {
    position: relative !important;
    }
            
    .position-absolute {
    position: absolute !important;
    }
            
    .right-0 {
    right: 0 !important;
    }
            
    .top-0 {
    top: 0 !important;
    }
            
    .m-2 {
    margin: var(--base-size-8, 8px) !important;
    }
            
    .color-fg-success,
    .fgColor-success {
    color: #3fb950 !important;
    }
</style>
<script>
    document.addEventListener('clipboard-copy', function (event) {
    const notice_copy = event.target.querySelector('.clipboard-copy-icon');
    const notice_check = event.target.querySelector('.clipboard-check-icon');
    notice_copy.classList.add("d-none");
    notice_check.classList.remove("d-none");
    setTimeout(function () {
        notice_copy.classList.remove("d-none");
        notice_check.classList.add("d-none");
    }, 1000)
    })
</script>`;

    // This method is called when your extension is activated
    // Your extension is activated the very first time the command is executed
    export function extendMarkdownIt(context: vscode.ExtensionContext | undefined, md: MarkdownIt): MarkdownIt {
        if (!!context) {
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(markdownCodeCopySetting)) {
                    vscode.commands.executeCommand('markdown.api.reloadPlugins');
                }
            }, undefined, context.subscriptions);
        }
        const config = vscode.workspace.getConfiguration('markdown', null);
        if (!config.get<boolean>('code-copy.enabled', true)) {
            return md;
        }
        // return md.use(require('markdown-it-code-copy'), {});
        return md.use(codecopy_render, {});
    };
    const escapeHtml = (unsafe: string) => {
        return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
    };

    const codecopy_render = (md: MarkdownIt, _o: any): void => {
        // https://github.com/mermaid-js/mermaid/blob/579f1f9dc156dd72326efdb3880a351a3dee96a1/packages/mermaid/src/mermaid.ts#L162
        // transforms the html to pure text
        let dedent_header = dedent(require('entity-decode')(get_clipboardjs_header())) // removes indentation, required for Markdown parsing
            .trim()
            .replace(/<br\s*\/?>/gi, '<br/>');
        md.renderer.rules.code_block = copy_render(md.renderer.rules?.code_block, dedent_header);
        md.renderer.rules.fence = copy_render(md.renderer.rules?.fence, dedent_header);
        // md.renderer.rules.image = copy_render(md.renderer.rules?.image);
        md.renderer.rules.html_block = copy_render(md.renderer.rules?.html_block, dedent_header);
    };
    const copy_render = (rule: MarkdownIt.Renderer.RenderRule | undefined, dedent_header: string): MarkdownIt.Renderer.RenderRule => {
        return (tokens, idx, options, env, self) => {
            const token = tokens[idx];
            if (!rule) {
                return `<pre>${token.content}</pre>`;
            }
            let code = token.content;
            if (token.type === 'image') {
                code = token.attrGet('src') || token.attrGet('data-src') || token.content;
            }
            let quote_escaped_code = escapeHtml(code); // escape html, required for HTML parsing

            const header = !env.clipboardjs_header_added ? dedent_header : "";
            env.clipboardjs_header_added = true;
            return `${header}<div class="snippet-clipboard-content notranslate position-relative overflow-auto">
              ${rule(tokens, idx, options, env, self)}
              <div class="zeroclipboard-container position-absolute right-0 top-0">
                <clipboard-copy aria-label="Copy" class="ClipboardButton btn clipboard-copy m-2 p-0 tooltipped-no-delay"
                  value="${quote_escaped_code}" tabindex="0" role="button">
                  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true"
                    class="octicon octicon-copy clipboard-copy-icon m-2">
                    <path
                      d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z">
                    </path>
                    <path
                      d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z">
                    </path>
                  </svg>
                  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true"
                    class="octicon octicon-check clipboard-check-icon color-fg-success d-none m-2">
                    <path
                      d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z">
                    </path>
                  </svg>
                </clipboard-copy>
              </div>
            </div>`;
        };
    };
}