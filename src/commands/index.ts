/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { CommandManager } from './commandManager';
import { TelemetryReporter } from '../reporter/telemetryReporter';
import { ShowLockedPreviewToSideCommand, ShowPreviewCommand, ShowPreviewToSideCommand } from './showPreview';
import { MarkdownPreviewManager } from '../renders/previewManager';

export function registerMarkdownCommands(
    commandManager: CommandManager,
    markdownPreviewManager: MarkdownPreviewManager,
    telemetryReporter?: TelemetryReporter,
): vscode.Disposable {
    commandManager.register(new ShowPreviewCommand(markdownPreviewManager, telemetryReporter));
    commandManager.register(new ShowPreviewToSideCommand(markdownPreviewManager, telemetryReporter));
    commandManager.register(new ShowLockedPreviewToSideCommand(markdownPreviewManager, telemetryReporter));

    return commandManager;
}
