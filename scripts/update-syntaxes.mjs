// Regenerates syntaxes/markdown.tmLanguage.json and the grammar contribution in package.json
// from VS Code's builtin markdown-basics extension.
// usage: node scripts/update-syntaxes.mjs [path or URL of the markdown-basics extension directory]
import { readFile, writeFile } from 'node:fs/promises';

const base = (process.argv[2] ?? 'https://raw.githubusercontent.com/microsoft/vscode/main/extensions/markdown-basics').replace(/\/$/, '');
const source = `${base}/syntaxes/markdown.tmLanguage.json`;
const target = new URL('../syntaxes/markdown.tmLanguage.json', import.meta.url);
const packageTarget = new URL('../package.json', import.meta.url);

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

const grammar = JSON.parse(await load(source));
const builtin = JSON.parse(await load(`${base}/package.json`)).contributes?.grammars
    ?.find((contribution) => contribution.language === 'markdown');
if (!builtin) {
    throw new Error(`no markdown grammar contribution in ${base}/package.json`);
}
grammar.name = 'Markdown-Preview';

// Indented lines are highlighted as Markdown rather than code, matching the preview's default
// `markdown.indented-code.enabled: false`; a grammar can't follow the setting, see #96.
rule(grammar, 'raw_block').patterns = [
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

// Our grammar replaces the builtin one, so its contribution must declare the same embedded languages.
const pkg = JSON.parse(await readFile(packageTarget, 'utf8'));
const contribution = pkg.contributes.grammars.find((contribution) => contribution.language === 'markdown');
contribution.embeddedLanguages = builtin.embeddedLanguages;
contribution.unbalancedBracketScopes = builtin.unbalancedBracketScopes;

await writeFile(target, JSON.stringify(grammar, null, 4) + '\n');
await writeFile(packageTarget, JSON.stringify(pkg, null, 2) + '\n');
console.log(`syntaxes/markdown.tmLanguage.json and package.json <- ${base} (${grammar.version})`);
