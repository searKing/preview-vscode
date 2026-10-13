import * as vscode from 'vscode';

// The Markdown grammar highlights fenced code blocks of a fixed list of languages, a TextMate grammar can't include
// a grammar by the info string. This injection grammar is generated from the languages and grammars contributed by the
// installed extensions. It matches the info string of the fenced code blocks of unknown languages only, the known
// ones consume the whole opening fence line. Grammars are loaded once, a changed one takes effect after reloading.
// The path is contributed in package.json, a placeholder is created by webpack.config.js.
const GRAMMAR_PATH = ['dist', 'syntaxes', 'markdown-fenced-languages.tmLanguage.json'];
const SCOPE_NAME = 'markdown.fenced-languages.injection';
const SETTING = 'fenced-languages.enabled';

interface Contributes {
	languages?: { id?: string; aliases?: string[] }[];
	grammars?: { language?: string; scopeName?: string; injectTo?: string[] }[];
}

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// language id -> [scopeName, names in info strings]
function contributedLanguages(): Map<string, [string, Set<string>]> {
	const scopes = new Map<string, string>();
	const names = new Map<string, Set<string>>();
	for (const extension of vscode.extensions.all) {
		const contributes: Contributes = extension.packageJSON?.contributes ?? {};
		for (const grammar of contributes.grammars ?? []) {
			if (!grammar.language || !grammar.scopeName || grammar.injectTo) {
				continue;
			}
			// some extensions contribute an injection grammar for a language too, prefer the source.* or text.* one.
			if (!scopes.has(grammar.language) || /^(source|text)\./.test(grammar.scopeName)) {
				scopes.set(grammar.language, grammar.scopeName);
			}
		}
		for (const language of contributes.languages ?? []) {
			if (!language.id) {
				continue;
			}
			const set = names.get(language.id) ?? new Set<string>();
			for (const name of [language.id, ...(language.aliases ?? [])]) {
				// info strings are words, aliases like "Linux Desktop File" are display names.
				if (/^[\w.+#-]+$/.test(name)) {
					set.add(name.toLowerCase());
				}
			}
			names.set(language.id, set);
		}
	}
	const languages = new Map<string, [string, Set<string>]>();
	for (const [id, scopeName] of scopes) {
		languages.set(id, [scopeName, names.get(id) ?? new Set([id.toLowerCase()])]);
	}
	return languages;
}

function generate(enabled: boolean): string {
	const repository: Record<string, unknown> = {};
	if (enabled) {
		for (const [id, [scopeName, names]] of [...contributedLanguages()].sort(([a], [b]) => a.localeCompare(b))) {
			repository[id] = {
				begin: `(?i)(?<=[\`~])\\s*(?:${[...names].sort().map(escapeRegExp).join('|')})((\\s+|:|,|\\{|\\?)[^\`~]*)?$`,
				end: '(^|\\G)(?=\\s*[`~]{3,}\\s*$)',
				contentName: `meta.embedded.block.${id}`,
				patterns: [{ include: scopeName }],
			};
		}
	}
	return JSON.stringify({
		scopeName: SCOPE_NAME,
		injectionSelector: 'L:markup.fenced_code.block.markdown',
		patterns: Object.keys(repository).map(id => ({ include: `#${id}` })),
		repository,
	}, null, '\t') + '\n';
}

async function update(context: vscode.ExtensionContext): Promise<void> {
	// the extension directory is read-only on the web.
	if (context.extensionUri.scheme !== 'file') {
		return;
	}
	const uri = vscode.Uri.joinPath(context.extensionUri, ...GRAMMAR_PATH);
	const grammar = generate(vscode.workspace.getConfiguration('markdown').get<boolean>(SETTING, true));
	const current = await vscode.workspace.fs.readFile(uri).then(data => new TextDecoder().decode(data), () => '');
	if (current === grammar) {
		return;
	}
	await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(grammar));
	const reload = 'Reload Window';
	if (await vscode.window.showInformationMessage('Highlighting of the fenced code blocks in Markdown changed, it takes effect after reloading the window.', reload) === reload) {
		await vscode.commands.executeCommand('workbench.action.reloadWindow');
	}
}

export function registerFencedLanguages(context: vscode.ExtensionContext): vscode.Disposable {
	const run = () => update(context).catch(e => console.error(`preview-vscode: failed to update ${SCOPE_NAME}`, e));
	run();
	return vscode.Disposable.from(
		vscode.extensions.onDidChange(run),
		vscode.workspace.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration(`markdown.${SETTING}`)) {
				run();
			}
		}),
	);
}
