// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import type MarkdownIt = require('markdown-it');

import { extendMarkdownIt } from '../renders/markdown-it-engine';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "preview-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	// 命令回调函数，该命令在package.json中与快捷方式、菜单选项等关联
	// 覆盖显示预览界面
	let previewDisposable = vscode.commands.registerCommand('preview-vscode.showPreview', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from preview-vscode!');
	});

	// 侧边栏打开预览界面
	let previewToSideDisposable = vscode.commands.registerCommand('preview-vscode.showPreviewToSide', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from preview-vscode!');
	});

	context.subscriptions.push(previewDisposable, previewToSideDisposable);
	return {
		extendMarkdownIt(md: MarkdownIt) {
			return extendMarkdownIt(context, md);
		}
	};
}

// This method is called when your extension is deactivated
export function deactivate() { }
