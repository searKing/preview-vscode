// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');

import { extendMarkdownIt } from '../renders/markdown-it-engine';
import { MarkdownPreviewManager } from '../renders/previewManager';
import { registerMarkdownCommands } from '../commands';
import { CommandManager } from '../commands/commandManager';

import { loadDefaultTelemetryReporter } from '../reporter/telemetryReporter';

// All settings contributed in package.json, the markdown-it plugins read them on every reload.
function contributedSettings(context: vscode.ExtensionContext): string[] {
	const configurations: { properties?: Record<string, unknown> }[] = [context.extension.packageJSON?.contributes?.configuration ?? []].flat();
	return configurations.flatMap(configuration => Object.keys(configuration.properties ?? {}));
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const telemetryReporter = loadDefaultTelemetryReporter();
	context.subscriptions.push(telemetryReporter);

	const markdownPreviewManager = new MarkdownPreviewManager();

	const commandManager = new CommandManager();
	context.subscriptions.push(registerMarkdownCommands(commandManager, markdownPreviewManager, telemetryReporter));

	const reloadPlugins = () => vscode.commands.executeCommand('markdown.api.reloadPlugins');
	const settings = contributedSettings(context);
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(e => {
			if (settings.some(setting => e.affectsConfiguration(setting))) {
				reloadPlugins();
			}
		}),
		// mermaid's "auto" theme follows the color theme.
		vscode.window.onDidChangeActiveColorTheme(reloadPlugins),
	);

	return {
		extendMarkdownIt(md: MarkdownIt) {
			return extendMarkdownIt(md, { markdownPreviewManager: markdownPreviewManager });
		}
	};
}

// This method is called when your extension is deactivated
export function deactivate() { }
