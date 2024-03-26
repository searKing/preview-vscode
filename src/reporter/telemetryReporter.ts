/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// https://code.visualstudio.com/api/extension-guides/telemetry#dos-and-donts 
import * as vscode from 'vscode';

interface IPackageInfo {
    name: string;
    version: string;
    aiKey: string;
}

export interface TelemetryReporter {
    dispose(): void;
    sendTelemetryEvent(eventName: string, properties?: {
        [key: string]: string;
    }): void;
}

const nullReporter = new class NullTelemetryReporter implements TelemetryReporter {
    sendTelemetryEvent() { /** noop */ }
    dispose() { /** noop */ }
};

class ExtensionReporter implements TelemetryReporter {
    private readonly _reporter: vscode.TelemetryLogger;

    constructor(
        packageInfo: IPackageInfo
    ) {
        // This is the appender which the extension would contribute
        const sender: vscode.TelemetrySender = {
            sendEventData: (eventName: string, data) => {
                console.log(`${packageInfo.aiKey}, event: ${eventName}, data: ${JSON.stringify(data)}`);
            },
            sendErrorData: (exception, data) => {
                console.error(`${packageInfo.aiKey}, exception: ${exception}, data: ${JSON.stringify(data)}`);
            },
            flush: () => { /* noop */ }
        };
        this._reporter = vscode.env.createTelemetryLogger(sender);
    }
    sendTelemetryEvent(eventName: string, properties?: {
        [key: string]: string;
    }) {
        this._reporter.logUsage(eventName, properties);
    }

    dispose() {
        this._reporter.dispose();
    }
}

export function loadDefaultTelemetryReporter(): TelemetryReporter {
    const packageInfo = getPackageInfo();
    return packageInfo ? new ExtensionReporter(packageInfo) : nullReporter;
}

function getPackageInfo(): IPackageInfo | null {
    const extension = vscode.extensions.getExtension('searKing.preview-vscode');
    if (extension && extension.packageJSON) {
        return {
            name: extension.packageJSON.name,
            version: extension.packageJSON.version,
            aiKey: extension.packageJSON.aiKey
        };
    }
    return null;
}
