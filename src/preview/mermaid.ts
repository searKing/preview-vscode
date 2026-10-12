import mermaid from 'mermaid';

// mermaid renders every `.mermaid` element on window load by itself, which races with us.
mermaid.startOnLoad = false;

let nextId = 0;

// Renders `<pre class="preview-vscode-mermaid">` blocks whose text is the (HTML escaped) diagram source.
export async function renderMermaid(elements: Iterable<HTMLElement>, theme: string): Promise<void> {
    // without suppressErrorRendering, a syntax error is "rendered" as an error diagram instead of thrown.
    mermaid.initialize({ startOnLoad: false, suppressErrorRendering: true, theme: theme as any });
    for (const element of elements) {
        if (element.dataset.processed) {
            continue;
        }
        const source = element.textContent?.trim() ?? '';
        if (!source) {
            continue;
        }
        element.dataset.processed = 'true';
        // The preview may replace the content while rendering, see `vscode.markdown.updateContent`.
        element.dataset.source = source;
        try {
            const { svg, bindFunctions } = await mermaid.render(`preview-vscode-mermaid-${nextId++}`, source);
            if (element.dataset.source !== source) {
                continue;
            }
            element.innerHTML = svg;
            bindFunctions?.(element);
        } catch (error) {
            if (element.dataset.source !== source) {
                continue;
            }
            element.classList.add('preview-vscode-error');
            element.textContent = `${error}\n\n${source}`;
        }
    }
}
