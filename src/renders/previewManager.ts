import * as vscode from "vscode";
import { Disposable } from "./util/dispose";

export class MarkdownPreviewManager extends Disposable {
    private lastActiveEditor: vscode.TextEditor | undefined;
    private lastActiveTextDocument: vscode.TextDocument | undefined;
    public constructor() {
        super();
        this.refresh();
        vscode.workspace.onDidOpenTextDocument((doc: vscode.TextDocument) => {
            this.lastActiveTextDocument = doc;
        });
    }
    public refresh(doc?: vscode.TextDocument) {
        this.lastActiveEditor = vscode.window.activeTextEditor;
        this.lastActiveTextDocument = doc || vscode.window.activeTextEditor?.document;
    }
    public editor(): vscode.TextEditor | undefined {
        return this.lastActiveEditor;
    }
    public uri(): vscode.Uri | undefined {
        return this.lastActiveTextDocument?.uri || this.lastActiveEditor?.document.uri;
    }
    public languageId(editor?: vscode.TextEditor): string {
        let doc = editor?.document || this.lastActiveTextDocument || this.lastActiveEditor?.document;
        let id = doc?.languageId;
        if (!!id) {
            return id;
        }

        // fallback to uri, activeTextEditor      
        let ext = this.uri()?.path.split('.').pop() || vscode.window.activeTextEditor?.document?.uri.path.split('.').pop();
        if (!ext) {
            // fallback to activeTab
            let tab = vscode.window.tabGroups.activeTabGroup.activeTab;
            if (!tab) {
                return "";
            }
            if (tab.input instanceof vscode.TabInputText) {
                ext = tab.input.uri.path.split('.').pop();
            } else if (tab.input instanceof vscode.TabInputTextDiff) {
                ext = tab.input.original.path.split('.').pop() || tab.input.modified.path.split('.').pop();
            } else if (tab.input instanceof vscode.TabInputCustom) {
                ext = tab.input.uri.path.split('.').pop();
            } else if (tab.input instanceof vscode.TabInputNotebook) {
                ext = tab.input.uri.path.split('.').pop();
            } else if (tab.input instanceof vscode.TabInputNotebookDiff) {
                ext = tab.input.original.path.split('.').pop() || tab.input.modified.path.split('.').pop();
            }
            ext = ext || tab.label.split('.').pop();
        }
        let tab = vscode.window.tabGroups.activeTabGroup.activeTab;
        if (!tab) {
            return "";
        }
        if (tab.input instanceof vscode.TabInputText) {
            ext = tab.input.uri.path.split('.').pop();
        } else if (tab.input instanceof vscode.TabInputTextDiff) {
            ext = tab.input.original.path.split('.').pop() || tab.input.modified.path.split('.').pop();
        } else if (tab.input instanceof vscode.TabInputCustom) {
            ext = tab.input.uri.path.split('.').pop();
        } else if (tab.input instanceof vscode.TabInputNotebook) {
            ext = tab.input.uri.path.split('.').pop();
        } else if (tab.input instanceof vscode.TabInputNotebookDiff) {
            ext = tab.input.original.path.split('.').pop() || tab.input.modified.path.split('.').pop();
        }
        ext = ext || tab.label.split('.').pop();

        if (!ext) {
            return "";
        }
        ext = `.${ext}`;
        // https://github.com/microsoft/vscode/issues/17885#issuecomment-663934897
        let ids = vscode.extensions.all
            .map(i => <any[]>(i.packageJSON as any)?.contributes?.languages)
            .filter(i => i)
            .reduce((a, b) => a.concat(b), [])
            .filter(i => i.extensions?.includes(ext))
            .map(i => i?.id)
            .filter((value, index, array) => array.indexOf(value) === index);
        if (!ids) {
            return "";
        }

        const supportIds = ["markdown", "html", "css", "mermaid", "restructuredtext", "jade", "pug"];
        ids = ids.filter(i => i).filter(i => supportIds?.includes(i));
        if (!!ids) {
            return ids[0];
        }
        return "";
    }
}
