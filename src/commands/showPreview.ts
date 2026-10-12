import * as vscode from 'vscode';
import { Command } from './commandManager';
import { TelemetryReporter } from '../reporter/telemetryReporter';
import { MarkdownPreviewManager } from '../renders/previewManager';

interface ShowPreviewSettings {
    readonly sideBySide?: boolean;
    readonly locked?: boolean;
}

async function showPreview(
    _markdownPreviewManager: MarkdownPreviewManager,
    telemetryReporter: TelemetryReporter | undefined,
    uri: vscode.Uri | undefined,
    previewSettings: ShowPreviewSettings,
): Promise<any> {
    let resource = uri;
    if (!(resource instanceof vscode.Uri)) {
        if (vscode.window.activeTextEditor) {
            // we are relaxed and don't check for markdown files
            resource = vscode.window.activeTextEditor.document.uri;
        }
    }

    if (!(resource instanceof vscode.Uri)) {
        if (!vscode.window.activeTextEditor) {
            // this is most likely toggling the preview
            return vscode.commands.executeCommand('markdown.showSource');
        }
        // nothing found that could be shown or toggled
        return;
    }

    // const resourceColumn = (vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn) || vscode.ViewColumn.One;
    // const previewColumn = previewSettings.sideBySide ? vscode.ViewColumn.Beside : resourceColumn;

    telemetryReporter?.sendTelemetryEvent('openPreview', {
        where: previewSettings.sideBySide ? 'sideBySide' : 'inPlace',
        how: (uri instanceof vscode.Uri) ? 'action' : 'palette'
    });
    _markdownPreviewManager.refresh();
    const supportIds = ["markdown", "html", "css", "mermaid", "restructuredtext", "jade", "pug"];
    const document = await vscode.workspace.openTextDocument(resource);
    if (!supportIds.includes(document.languageId)) {
        // the image URI under the cursor may have changed, while the document didn't.
        await vscode.commands.executeCommand('markdown.preview.refresh');
    }

    // The built-in commands open the document by uri, no need to show it in an editor first.
    if (previewSettings.sideBySide) {
        // this is most likely show preview to side.
        return vscode.commands.executeCommand(previewSettings.locked ? 'markdown.showLockedPreviewToSide' : 'markdown.showPreviewToSide', resource);
    }
    // this is most likely show preview inplace.
    return vscode.commands.executeCommand('markdown.showPreview', resource, undefined, { locked: previewSettings.locked });
}

export class ShowPreviewCommand implements Command {
    public readonly id = 'preview-vscode.showPreview';

    public constructor(
        private readonly _markdownPreviewManager: MarkdownPreviewManager,
        private readonly _telemetryReporter?: TelemetryReporter
    ) { }

    public async execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[], previewSettings?: ShowPreviewSettings) {
        // one by one, each preview depends on the active editor left by the previous one.
        for (const uri of Array.isArray(allUris) ? allUris : [mainUri]) {
            await showPreview(this._markdownPreviewManager, this._telemetryReporter, uri, {
                sideBySide: false,
                locked: previewSettings && previewSettings.locked
            });
        }
    }
}

export class ShowPreviewToSideCommand implements Command {
    public readonly id = 'preview-vscode.showPreviewToSide';

    public constructor(
        private readonly _markdownPreviewManager: MarkdownPreviewManager,
        private readonly _telemetryReporter?: TelemetryReporter
    ) { }

    public execute(uri?: vscode.Uri, previewSettings?: ShowPreviewSettings) {
        showPreview(this._markdownPreviewManager, this._telemetryReporter, uri, {
            sideBySide: true,
            locked: previewSettings && previewSettings.locked
        });
    }
}


export class ShowLockedPreviewToSideCommand implements Command {
    public readonly id = 'preview-vscode.showLockedPreviewToSide';

    public constructor(
        private readonly _markdownPreviewManager: MarkdownPreviewManager,
        private readonly _telemetryReporter?: TelemetryReporter
    ) { }

    public execute(uri?: vscode.Uri) {
        showPreview(this._markdownPreviewManager, this._telemetryReporter, uri, {
            sideBySide: true,
            locked: true
        });
    }
}
