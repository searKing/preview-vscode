import { window, commands } from "vscode";
export class MermaidPreview {
    // @Override
    static sendPreviewCommand(command) {
        if (command != this.COMMAND_BUTT) {
            return commands.executeCommand(command).then(() => {
            }, (reason) => {
                console.warn(reason);
                window.showErrorMessage(reason);
            });
        }
        return Promise.resolve();
    }
    static isMermaidFile(editor) {
        if (!editor || !editor.document || !editor.document.fileName) {
            return false;
        }
        if (editor.document.fileName.toLowerCase().endsWith(".mermaid")) {
            return true;
        }
        return false;
    }
}
MermaidPreview.COMMAND_BUTT = "";
//# sourceMappingURL=mermaidPreview.js.map