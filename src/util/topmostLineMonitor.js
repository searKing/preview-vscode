/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as vscode from 'vscode';
import { Disposable } from '../util/dispose';
import { isMarkdownFile } from './file';
export class TopmostLineMonitor extends Disposable {
    constructor() {
        super();
        this.pendingUpdates = new Map();
        this.throttle = 50;
        this._onChanged = this._register(new vscode.EventEmitter());
        this.onDidChanged = this._onChanged.event;
        this._register(vscode.window.onDidChangeTextEditorVisibleRanges(event => {
            if (isMarkdownFile(event.textEditor.document)) {
                const line = getVisibleLine(event.textEditor);
                if (typeof line === 'number') {
                    this.updateLine(event.textEditor.document.uri, line);
                }
            }
        }));
    }
    updateLine(resource, line) {
        const key = resource.toString();
        if (!this.pendingUpdates.has(key)) {
            // schedule update
            setTimeout(() => {
                if (this.pendingUpdates.has(key)) {
                    this._onChanged.fire({
                        resource,
                        line: this.pendingUpdates.get(key)
                    });
                    this.pendingUpdates.delete(key);
                }
            }, this.throttle);
        }
        this.pendingUpdates.set(key, line);
    }
}
/**
 * Get the top-most visible range of `editor`.
 *
 * Returns a fractional line number based the visible character within the line.
 * Floor to get real line number
 */
export function getVisibleLine(editor) {
    if (!editor.visibleRanges.length || !editor.visibleRanges[0]) {
        return undefined;
    }
    const firstVisiblePosition = editor.visibleRanges[0].start;
    const lineNumber = firstVisiblePosition.line;
    const line = editor.document.lineAt(lineNumber);
    const progress = firstVisiblePosition.character / (line.text.length + 2);
    return lineNumber + progress;
}
//# sourceMappingURL=topmostLineMonitor.js.map