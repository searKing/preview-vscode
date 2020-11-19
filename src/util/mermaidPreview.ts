import { window, commands, TextEditor } from "vscode";

export class MermaidPreview {
    public static COMMAND_BUTT: string = "";

    // @Override
    public static sendPreviewCommand(command: string): Thenable<void> {
        if (command != this.COMMAND_BUTT) {
            return commands.executeCommand(command).then(() => {
            }, (reason) => {
                console.warn(reason);
                window.showErrorMessage(reason);
            });
        }
        return Promise.resolve();
    }
    public static isMermaidFile(editor: TextEditor): boolean {
        if (!editor || !editor.document || !editor.document.fileName) {
            return false;
        }
        if (editor.document.fileName.toLowerCase().endsWith(".mermaid")) {
            return true;
        }
        return false;
    }

}
