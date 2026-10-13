// Tokenizes the Markdown samples in test-workspace with the grammars of the extension. Grammars of embedded languages
// other than shell are not loaded, their code blocks only get the scopes of the Markdown grammar.
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
const oniguruma = require('vscode-oniguruma');
const textmate = require('vscode-textmate');
const { assertSnapshot, readSample, samples } = require('./snapshot.cjs');

const repo = path.join(__dirname, '..');
const grammars = Object.fromEntries(require(path.join(repo, 'package.json')).contributes.grammars
	.map(grammar => [grammar.scopeName, path.join(repo, grammar.path)]));

const registry = new textmate.Registry({
	onigLib: (async () => {
		await oniguruma.loadWASM(fs.readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm')).buffer);
		return { createOnigScanner: (sources) => new oniguruma.OnigScanner(sources), createOnigString: (text) => new oniguruma.OnigString(text) };
	})(),
	loadGrammar: async (scopeName) => grammars[scopeName] && fs.existsSync(grammars[scopeName])
		? textmate.parseRawGrammar(fs.readFileSync(grammars[scopeName], 'utf8'), grammars[scopeName])
		: null,
});

// One line per token: the line number, the text and its scopes after `text.html.markdown`.
function tokenize(grammar, text) {
	let state = textmate.INITIAL;
	return text.split(/\r?\n/).flatMap((line, index) => {
		const result = grammar.tokenizeLine(line, state);
		state = result.ruleStack;
		return result.tokens.map(token => `${index + 1}: ${JSON.stringify(line.slice(token.startIndex, token.endIndex))} ${token.scopes.slice(1).join(' ')}`.trimEnd());
	}).join('\n') + '\n';
}

for (const name of samples('.md')) {
	test(`grammar ${name}`, async () => {
		const grammar = await registry.loadGrammar('text.html.markdown');
		assertSnapshot(`grammar/${name}.txt`, tokenize(grammar, readSample(name)));
	});
}
