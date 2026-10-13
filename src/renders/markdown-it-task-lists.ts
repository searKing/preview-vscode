import type MarkdownIt from 'markdown-it';
import type { Token } from 'markdown-it';

// GitHub-style task lists, replaces markdown-it-task-lists: its labelAfter mode copies the raw
// Markdown into the label, so inline syntax after the checkbox (footnotes, links, ...) is duplicated.
export interface TaskListsOptions {
    enabled?: boolean; // checkboxes can be toggled, rendered disabled otherwise
    label?: boolean; // wrap the item text in a <label> for the checkbox
    labelAfter?: boolean; // put the <label> after the checkbox instead of around it
}

const TODO_MARKER = /^\[([ xX])\][ \t]/;

export default function taskLists(md: MarkdownIt, options: TaskListsOptions = {}): void {
    const { enabled = false, label = false, labelAfter = false } = options;

    md.core.ruler.after('inline', 'task-lists', (state) => {
        const tokens = state.tokens;
        let nextId = 0;
        for (let i = 2; i < tokens.length; i++) {
            const inline = tokens[i];
            const item = inline.type === 'inline' ? listItemIndex(tokens, i) : -1;
            if (item < 0) {
                continue;
            }
            const marker = TODO_MARKER.exec(inline.content);
            const first = inline.children?.[0];
            if (!marker || first?.type !== 'text' || !first.content.startsWith(marker[0])) {
                continue;
            }
            first.content = first.content.slice(marker[0].length);
            inline.content = inline.content.slice(marker[0].length);

            const id = `task-item-${nextId++}`;
            const html = (content: string) => Object.assign(new state.Token('html_inline', '', 0), { content });
            const checkbox = html('<input class="task-list-item-checkbox" type="checkbox"'
                + (marker[1] === ' ' ? '' : ' checked=""')
                + (enabled ? '' : ' disabled=""')
                + (label && labelAfter ? ` id="${id}"` : '')
                + '>');
            const children = inline.children!;
            if (!label) {
                children.unshift(checkbox);
            } else if (labelAfter) {
                children.unshift(checkbox, html(`<label class="task-list-item-label" for="${id}">`));
                children.push(html('</label>'));
            } else {
                children.unshift(html('<label>'), checkbox);
                children.push(html('</label>'));
            }

            addClass(tokens[item], 'task-list-item');
            if (enabled) {
                addClass(tokens[item], 'enabled');
            }
            const list = parentIndex(tokens, item);
            if (list >= 0) {
                addClass(tokens[list], 'contains-task-list');
            }
        }
    });
}

function addClass(token: Token, name: string): void {
    const classes = (token.attrGet('class') ?? '').split(/\s+/).filter(Boolean);
    if (!classes.includes(name)) {
        token.attrSet('class', [...classes, name].join(' '));
    }
}

// The list item whose first block holds the inline token at `index`: a paragraph, or the first term
// of a definition list (`1. [x] term` followed by an indented `: definition`).
function listItemIndex(tokens: Token[], index: number): number {
    if (tokens[index - 1].type === 'paragraph_open' && tokens[index - 2].type === 'list_item_open') {
        return index - 2;
    }
    if (index >= 3 && tokens[index - 1].type === 'dt_open' && tokens[index - 2].type === 'dl_open' && tokens[index - 3].type === 'list_item_open') {
        return index - 3;
    }
    return -1;
}

function parentIndex(tokens: Token[], index: number): number {
    const level = tokens[index].level - 1;
    for (let i = index - 1; i >= 0; i--) {
        if (tokens[i].level === level) {
            return i;
        }
    }
    return -1;
}
