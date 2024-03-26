/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Code borrowed from https://github.com/microsoft/vscode/blob/1.87.1/extensions/markdown-language-features/src/util/schemes.ts

export const Schemes = Object.freeze({
	http: 'http',
	https: 'https',
	file: 'file',
	untitled: 'untitled',
	mailto: 'mailto',
	vscode: 'vscode',
	'vscode-insiders': 'vscode-insiders',
	notebookCell: 'vscode-notebook-cell',
});

export function isOfScheme(scheme: string, link: string): boolean {
	return link.toLowerCase().startsWith(scheme + ':');
}
