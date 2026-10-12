import * as vscode from "vscode";
import { Disposable } from "./util/dispose";

export class MarkdownPreviewManager extends Disposable {
    private lastActiveEditor: vscode.TextEditor | undefined;
    private currentDocument: vscode.TextDocument | undefined;
    public constructor() {
        super();
        this.refresh();
    }
    public refresh() {
        this.lastActiveEditor = vscode.window.activeTextEditor || this.lastActiveEditor;
    }

    // The built-in Markdown engine parses `document.getText()` with an empty env,
    // so the source text is the only hint of which document is being rendered.
    public resolveDocument(src: string): vscode.TextDocument | undefined {
        const docs = vscode.workspace.textDocuments.filter(doc => doc.getText() === src);
        const preferred = this.lastActiveEditor?.document;
        this.currentDocument = docs.find(doc => doc === preferred) ?? docs[0];
        return this.currentDocument;
    }
    public document(): vscode.TextDocument | undefined {
        return this.currentDocument;
    }
    public editor(doc: vscode.TextDocument): vscode.TextEditor | undefined {
        return vscode.window.visibleTextEditors.find(editor => editor.document === doc)
            ?? (this.lastActiveEditor?.document === doc ? this.lastActiveEditor : undefined);
    }
}
