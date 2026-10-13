import type { LanguageFn } from 'highlight.js';
import markdown from 'highlight.js/lib/languages/markdown';

// highlight.js' Markdown grammar doesn't know front matter, highlight it as YAML like the Markdown grammar of the editor.
// Only a closed front matter at the very start of the code block, a `---` elsewhere is a thematic break or a setext heading.
export const markdownWithFrontMatter: LanguageFn = (hljs) => {
    const language = markdown(hljs);
    return {
        ...language,
        contains: [
            {
                begin: /(?<![\s\S])---[ \t]*\r?\n(?=[\s\S]*?^---[ \t]*$)/,
                end: /^---[ \t]*$/,
                excludeBegin: true,
                excludeEnd: true,
                subLanguage: 'yaml',
            },
            ...(language.contains ?? []),
        ],
    };
};
