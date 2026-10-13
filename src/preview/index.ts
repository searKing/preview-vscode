// Loaded into the built-in Markdown preview by `markdown.previewScripts`.
// Inline <script> in the rendered Markdown never runs there, the preview's CSP only allows nonce scripts,
// unless the preview security is "Disable", see ./scripts.
import './nonce';
import './scripts';
import '@github/clipboard-copy-element';

function renderMermaidBlocks() {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('pre.preview-vscode-mermaid:not([data-processed])'));
    if (elements.length > 0) {
        // mermaid is loaded on demand, most previews have no diagrams.
        import('./mermaid').then(({ renderMermaid }) => renderMermaid(elements, elements[0].dataset.theme || 'default'));
    }
}

document.addEventListener('clipboard-copy', (event) => {
    const button = event.target as HTMLElement;
    const copyIcon = button.querySelector('.clipboard-copy-icon');
    const checkIcon = button.querySelector('.clipboard-check-icon');
    button.classList.add('color-fg-success');
    copyIcon?.classList.add('d-none');
    checkIcon?.classList.remove('d-none');
    setTimeout(() => {
        button.classList.remove('color-fg-success');
        copyIcon?.classList.remove('d-none');
        checkIcon?.classList.add('d-none');
    }, 1000);
});

// The preview appends its initial content some time after DOMContentLoaded (once styles are loaded),
// without `vscode.markdown.updateContent`, and this async script may run before or after that.
let scheduled = false;
new MutationObserver(() => {
    if (!scheduled) {
        scheduled = true;
        queueMicrotask(() => {
            scheduled = false;
            renderMermaidBlocks();
        });
    }
}).observe(document.documentElement, { childList: true, subtree: true });
renderMermaidBlocks();
