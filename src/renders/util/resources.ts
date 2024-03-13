/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Code borrowed from https://github.com/microsoft/vscode/blob/1.87.1/extensions/markdown-language-features/src/util/resources.ts


import * as vscode from 'vscode';

export interface WebviewResourceProvider {
	asWebviewUri(resource: vscode.Uri): vscode.Uri;

	readonly cspSource: string;
}

