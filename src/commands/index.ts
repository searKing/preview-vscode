/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { CommandManager } from './commandManager';
import { TelemetryReporter } from '../reporter/telemetryReporter';
import { ShowLockedPreviewToSideCommand, ShowPreviewCommand, ShowPreviewToSideCommand } from './showPreview';

export function registerMarkdownCommands(
    commandManager: CommandManager,
    telemetryReporter?: TelemetryReporter,
): vscode.Disposable {
    commandManager.register(new ShowPreviewCommand(telemetryReporter));
    commandManager.register(new ShowPreviewToSideCommand(telemetryReporter));
    commandManager.register(new ShowLockedPreviewToSideCommand(telemetryReporter));

    return commandManager;
}
