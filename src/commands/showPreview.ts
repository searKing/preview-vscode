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
        how: (uri instanceof vscode.Uri) ? 'action' : 'pallete'
    });
    // await vscode.commands.executeCommand('editor.action.commentLine');
    // await vscode.commands.executeCommand('editor.action.commentLine');
    let editor = vscode.window.activeTextEditor;
    // if (!editor) {
    //     // this is most likely toggling the preview
    //     return vscode.commands.executeCommand('markdown.showSource');
    // }
    if (!editor || editor.document.uri.toString() !== resource.toString()) {
        // this is a different file
        // so no need to show it again
        // return;
        await vscode.commands.executeCommand('vscode.open', uri, <vscode.TextDocumentShowOptions>{
            preserveFocus: true,
            preview: true,
        });
        editor = vscode.window.activeTextEditor;
        _markdownPreviewManager.refresh();
        editor?.hide();
    } else {
        _markdownPreviewManager.refresh();
    }
    const supportIds = ["markdown", "html", "css", "mermaid", "restructuredtext", "jade", "pug"];
    if (editor && !supportIds.includes(editor.document.languageId)) {
        // defer set text editor dirty.
        // await editor.edit((editBuilder) => {
        //     editBuilder.insert(new vscode.Position(0, 0), " ");
        // }, { undoStopBefore: false, undoStopAfter: false });

        // await editor.edit((editBuilder) => {
        //     editBuilder.delete(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 1)));
        // }, { undoStopBefore: false, undoStopAfter: false });
        await vscode.commands.executeCommand('markdown.preview.refresh');
    }

    if (previewSettings.sideBySide) {
        // this is most likely show preview to side.
        return vscode.commands.executeCommand('markdown.showPreviewToSide');
    }
    // this is most likely show preview inplace.
    return vscode.commands.executeCommand('markdown.showPreview');
}

export class ShowPreviewCommand implements Command {
    public readonly id = 'preview-vscode.showPreview';

    public constructor(
        private readonly _markdownPreviewManager: MarkdownPreviewManager,
        private readonly _telemetryReporter?: TelemetryReporter
    ) { }

    public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[], previewSettings?: ShowPreviewSettings) {
        for (const uri of Array.isArray(allUris) ? allUris : [mainUri]) {
            showPreview(this._markdownPreviewManager, this._telemetryReporter, uri, {
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
