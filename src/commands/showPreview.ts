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
): Promise<unknown> {
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
    if (document.languageId === 'restructuredtext' && await showEsbonioPreview(document, previewSettings)) {
        return;
    }
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

// Esbonio renders reStructuredText with Sphinx, with `markdown.rst.esbonio.enabled` prefer its preview for
// files of a Sphinx project when its language server is running, its preview commands exist even if the server failed to start, e.g. without
// its Python package, and it previews nothing for other files. Its commands preview the active editor.
async function showEsbonioPreview(document: vscode.TextDocument, previewSettings: ShowPreviewSettings): Promise<boolean> {
    if (!vscode.workspace.getConfiguration('markdown', document.uri).get<boolean>('rst.esbonio.enabled', false)) {
        return false;
    }
    const esbonio = vscode.extensions.getExtension('swyddfa.esbonio');
    if (!esbonio || !(await inSphinxProject(document.uri))) {
        return false;
    }
    const api = await Promise.resolve(esbonio.activate()).catch(() => undefined);
    const LANGUAGE_CLIENT_RUNNING = 2; // vscode-languageclient's State.Running
    if (api?.client?.server?.state !== LANGUAGE_CLIENT_RUNNING) {
        return false;
    }
    const command = previewSettings.sideBySide ? 'esbonio.preview.openSide' : 'esbonio.preview.open';
    if (!(await vscode.commands.getCommands(true)).includes(command)) {
        return false;
    }
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand(command);
    return true;
}

// A Sphinx project has a conf.py in the directory of the file or above, up to the workspace folder.
async function inSphinxProject(uri: vscode.Uri): Promise<boolean> {
    const root = vscode.workspace.getWorkspaceFolder(uri)?.uri.path;
    let dir = vscode.Uri.joinPath(uri, '..');
    while (true) {
        try {
            await vscode.workspace.fs.stat(vscode.Uri.joinPath(dir, 'conf.py'));
            return true;
        } catch {
            // no conf.py here
        }
        const parent = vscode.Uri.joinPath(dir, '..');
        if (dir.path === root || parent.path === dir.path) {
            return false;
        }
        dir = parent;
    }
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
