import mermaid from 'mermaid';

let nextId = 0;

// Renders `<pre class="mermaid">` blocks whose text is the (HTML escaped) diagram source.
export async function renderMermaid(elements: Iterable<HTMLElement>, theme: string): Promise<void> {
    mermaid.initialize({ startOnLoad: false, theme: theme as any });
    for (const element of elements) {
        if (element.dataset.processed) {
            continue;
        }
        element.dataset.processed = 'true';
        const source = element.textContent ?? '';
        try {
            const { svg, bindFunctions } = await mermaid.render(`preview-vscode-mermaid-${nextId++}`, source);
            element.innerHTML = svg;
            bindFunctions?.(element);
        } catch (error) {
            element.classList.add('preview-vscode-error');
            element.textContent = `${error}\n\n${source}`;
        }
    }
}
