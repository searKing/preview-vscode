// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');

import { extendMarkdownIt } from '../renders/markdown-it-engine';
import { MarkdownPreviewManager } from '../renders/previewManager';
import { registerMarkdownCommands } from '../commands';
import { CommandManager } from '../commands/commandManager';

import { loadDefaultTelemetryReporter } from '../reporter/telemetryReporter';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "preview-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	const telemetryReporter = loadDefaultTelemetryReporter();
	context.subscriptions.push(telemetryReporter);

	const markdownPreviewManager = new MarkdownPreviewManager();

	const commandManager = new CommandManager();
	context.subscriptions.push(registerMarkdownCommands(commandManager, markdownPreviewManager, telemetryReporter));
	return {
		extendMarkdownIt(md: MarkdownIt) {
			return extendMarkdownIt(context, md, { markdownPreviewManager: markdownPreviewManager });
		}
	};
}

// This method is called when your extension is deactivated
export function deactivate() { }
