// Regenerates syntaxes/markdown.tmLanguage.json, syntaxes/shell.tmLanguage.json and the grammar
// contribution in package.json from VS Code's builtin markdown-basics and shellscript extensions.
// usage: node scripts/update-syntaxes.mjs [path or URL of VS Code's extensions directory]
import { readFile, writeFile } from 'node:fs/promises';

const base = (process.argv[2] ?? 'https://raw.githubusercontent.com/microsoft/vscode/main/extensions').replace(/\/$/, '');
const target = new URL('../syntaxes/markdown.tmLanguage.json', import.meta.url);
const shellTarget = new URL('../syntaxes/shell.tmLanguage.json', import.meta.url);
const packageTarget = new URL('../package.json', import.meta.url);
const shellScope = 'source.shell.markdown-preview';

async function load(location) {
    if (!/^https?:/.test(location)) {
        return readFile(location, 'utf8');
    }
    const response = await fetch(location);
    if (!response.ok) {
        throw new Error(`${location}: ${response.status} ${response.statusText}`);
    }
    return response.text();
}

function rule(grammar, name) {
    const found = grammar.repository[name];
    if (!found) {
        throw new Error(`rule "${name}" not found, the builtin grammar changed`);
    }
    return found;
}

const grammar = JSON.parse(await load(`${base}/markdown-basics/syntaxes/markdown.tmLanguage.json`));
const shell = JSON.parse(await load(`${base}/shellscript/syntaxes/shell-unix-bash.tmLanguage.json`));
const builtin = JSON.parse(await load(`${base}/markdown-basics/package.json`)).contributes?.grammars
    ?.find((contribution) => contribution.language === 'markdown');
if (!builtin) {
    throw new Error(`no markdown grammar contribution in ${base}/markdown-basics/package.json`);
}
grammar.name = 'Markdown-Preview';

// Indented lines are highlighted as Markdown rather than code, matching the preview's default
// `markdown.indented-code.enabled: false`; a grammar can't follow the setting, see #96.
// The `meta` scope is not colored by themes, unlike `markup.raw`.
const rawBlock = rule(grammar, 'raw_block');
if (rawBlock.name !== 'markup.raw.block.markdown') {
    throw new Error(`unexpected raw_block scope: ${rawBlock.name}`);
}
rawBlock.name = 'meta.indented.block.markdown';
rawBlock.patterns = [
    { include: 'text.html.derivative' },
    { include: 'text.html.markdown' },
];

// Setext heading underlines inside indented blocks start at \G, not at the beginning of the line.
for (const pattern of rule(grammar, 'heading-setext').patterns) {
    if (!pattern.match.startsWith('^')) {
        throw new Error(`unexpected heading-setext pattern: ${pattern.match}`);
    }
    pattern.match = `(?:^|\\G)${pattern.match.slice(1)}`;
}

// In a list item the list rule consumes the indent, so shell code starts after a space, where
// the builtin shell grammar doesn't start a command, see #106. Our copy also starts one at \G.
const statement = rule(shell, 'normal_statement');
const commandStart = '|(?<=(?:^|;|';
if (statement.begin.split(commandStart).length !== 2) {
    throw new Error(`unexpected normal_statement pattern: ${statement.begin}`);
}
statement.begin = statement.begin.replace(commandStart, `|\\G${commandStart}`);
shell.name = 'Shell-Preview';
shell.scopeName = shellScope;
const shellBlock = rule(grammar, 'fenced_code_block_shell').patterns
    ?.flatMap((pattern) => pattern.patterns ?? [])
    .find((pattern) => pattern.include === 'source.shell');
if (!shellBlock) {
    throw new Error('fenced_code_block_shell doesn\'t include source.shell');
}
shellBlock.include = shellScope;

// Front matter only starts the document (\A), so in a Markdown code block it was highlighted as a
// separator and a setext heading, see #103. The code block may also start with front matter.
// The rule below starts at the end of the opening fence line (`\G$`, where the upstream content rule
// starts too) and lasts until the closing fence, so front matter is only recognized on the first
// line; the upstream content rule is kept for the lines it restarts on.
const markdownBlock = rule(grammar, 'fenced_code_block_markdown');
const [markdownContent] = markdownBlock.patterns;
if (markdownBlock.patterns.length !== 1 || markdownContent.begin !== '(^|\\G)(\\s*)(.*)'
    || markdownContent.contentName !== 'meta.embedded.block.markdown') {
    throw new Error(`unexpected fenced_code_block_markdown patterns: ${JSON.stringify(markdownBlock.patterns)}`);
}
const frontMatter = rule(grammar, 'frontMatter');
const [frontMatterContent] = frontMatter.patterns;
if (frontMatter.begin !== '\\A(?=(-{3,}))' || frontMatterContent?.contentName !== 'meta.embedded.block.frontmatter') {
    throw new Error(`unexpected frontMatter: ${JSON.stringify(frontMatter)}`);
}
const frontMatterEnd = '\\s*-{3,}[ \\t]*$|[ \\t]*\\.{3}$';
const markdownUntilClosingFence = (begin, captures) => ({
    begin,
    beginCaptures: captures,
    while: '(?:^|\\G)',
    contentName: markdownContent.contentName,
    patterns: markdownContent.patterns,
});
markdownBlock.patterns = [
    {
        begin: '\\G$',
        while: markdownContent.while,
        patterns: [
            {
                begin: '(?:^|\\G)\\s*(-{3,})(.*)$',
                beginCaptures: frontMatterContent.beginCaptures,
                while: '(?:^|\\G)',
                patterns: [
                    {
                        // The end of the `---` line, a closing `---` line is matched by the next rule.
                        begin: '\\G$',
                        while: `(?:^|\\G)(?!${frontMatterEnd})`,
                        contentName: frontMatterContent.contentName,
                        patterns: frontMatterContent.patterns,
                    },
                    markdownUntilClosingFence(`(?:^|\\G)(?:${frontMatterEnd})`, frontMatter.endCaptures),
                ],
            },
            // Not at the end of the opening fence line: line start, or after a consumed list or quote indent.
            markdownUntilClosingFence('(?:^(?!\\z)|\\G(?!$)|\\G(?<=[ \\t>]))'),
        ],
    },
    markdownContent,
];

// Our grammar replaces the builtin one, so its contribution must declare the same embedded languages.
const pkg = JSON.parse(await readFile(packageTarget, 'utf8'));
const contribution = pkg.contributes.grammars.find((contribution) => contribution.language === 'markdown');
contribution.embeddedLanguages = builtin.embeddedLanguages;
contribution.unbalancedBracketScopes = builtin.unbalancedBracketScopes;

await writeFile(target, JSON.stringify(grammar, null, 4) + '\n');
await writeFile(shellTarget, JSON.stringify(shell, null, 4) + '\n');
await writeFile(packageTarget, JSON.stringify(pkg, null, 2) + '\n');
console.log(`syntaxes/{markdown,shell}.tmLanguage.json and package.json <- ${base} (${grammar.version}, ${shell.version})`);
