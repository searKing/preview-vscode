// Loads the bundled extension (dist/extension/node/extension.js, built by `npm run compile`) with a mocked `vscode`,
// and renders documents like the built-in Markdown preview does with the markdown-it plugins of the extension.
const Module = require('module');
const path = require('path');
const { URI, Utils } = require('vscode-uri');

const repo = path.join(__dirname, '..');
const packageJSON = require(path.join(repo, 'package.json'));

// Documents are previewed from a fixed path, so the paths rewritten relative to them don't depend on the checkout.
const workspace = '/path/to/preview-vscode/test-workspace';

const defaults = Object.assign({}, ...[packageJSON.contributes.configuration].flat()
	.flatMap(configuration => Object.entries(configuration.properties))
	.map(([key, property]) => ({ [key]: property.default })));

class Disposable {
	constructor(dispose) { this._dispose = dispose; }
	dispose() { this._dispose?.(); }
	static from(...disposables) { return new Disposable(() => disposables.forEach(d => d.dispose())); }
}
const event = () => new Disposable();
const textDocuments = [];

const vscode = {
	Disposable,
	ColorThemeKind: { Light: 1, Dark: 2, HighContrast: 3, HighContrastLight: 4 },
	ViewColumn: { One: 1, Beside: -2 },
	Uri: Object.assign(Object.create(URI), { file: URI.file, parse: URI.parse, joinPath: Utils.joinPath }),
	workspace: {
		getConfiguration: (section) => ({ get: (key, value) => defaults[`${section}.${key}`] ?? value }),
		onDidChangeConfiguration: event,
		getWorkspaceFolder: () => undefined,
		textDocuments,
	},
	window: {
		activeTextEditor: undefined,
		visibleTextEditors: [],
		activeColorTheme: { kind: 2 },
		onDidChangeActiveColorTheme: event,
	},
	commands: { registerCommand: event, executeCommand: async () => undefined },
	env: { createTelemetryLogger: () => ({ logUsage() { }, dispose() { } }), uriScheme: 'vscode' },
	extensions: { all: [], getExtension: () => ({ packageJSON }), onDidChange: event },
};

const load = Module._load;
Module._load = function (request, ...rest) {
	return request === 'vscode' ? vscode : load.call(this, request, ...rest);
};
const extension = require(path.join(repo, 'dist/extension/node/extension.js'));
const api = extension.activate({
	subscriptions: [],
	extension: { packageJSON },
	// not a file, the fenced languages grammar is not generated.
	extensionUri: URI.parse('mock:/preview-vscode'),
});

const languageIds = {
	'.md': 'markdown', '.html': 'html', '.css': 'css', '.mermaid': 'mermaid', '.mmd': 'mermaid',
	'.rst': 'restructuredtext', '.jade': 'jade', '.pug': 'pug',
};

function languageId(file) {
	return languageIds[path.extname(file)];
}

// Renders the text of a file in test-workspace like the preview of it.
function render(name, text) {
	const document = { uri: URI.file(path.posix.join(workspace, name)), languageId: languageId(name), getText: () => text };
	textDocuments.splice(0, textDocuments.length, document);
	const md = require('markdown-it')({ html: true, linkify: true });
	api.extendMarkdownIt(md);
	return md.render(text, { currentDocument: document.uri });
}

module.exports = { languageId, render };
