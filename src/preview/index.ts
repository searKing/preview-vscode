// Loaded into the built-in Markdown preview by `markdown.previewScripts`.
// Inline <script> in the rendered Markdown never runs there, the preview's CSP only allows nonce scripts.
import '@github/clipboard-copy-element';
import { renderMermaid } from './mermaid';

function renderMermaidBlocks() {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('pre.mermaid:not([data-processed])'));
    if (elements.length > 0) {
        renderMermaid(elements, elements[0].dataset.theme || 'default');
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

window.addEventListener('vscode.markdown.updateContent', renderMermaidBlocks);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMermaidBlocks);
} else {
    renderMermaidBlocks();
}
