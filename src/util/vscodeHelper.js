import * as vscode from "vscode";
export class VscodeHelper {
    // token or gist input
    static getInputBox(boxTag) {
        if (!boxTag || boxTag == "") {
            boxTag = "Enter Something";
        }
        const options = {
            placeHolder: boxTag,
            password: false,
            prompt: "Link is opened to get the github token."
        };
        return options;
    }
    static async getPreviewTypeQuickPick() {
        const items = [
            {
                label: "image",
                description: "Preview Image"
            }, {
                label: "css",
                description: "Preview CSS"
            }, {
                label: "mermaid",
                description: "Preview Mermaid"
            }, {
                label: "markdown",
                description: "Preview Markdown"
            }, {
                label: "rst",
                description: "Preview ReStructuredText"
            }, {
                label: "html",
                description: "Preview HTML and Jade"
            }
        ];
        //Ask what they want to do:
        let choice = await vscode.window.showQuickPick(items, {
            matchOnDescription: true,
            placeHolder: "Couldn't determine type to preview, please choose."
        });
        if (!choice || !choice.label) {
            throw new Error("no preview type selected");
        }
        return choice.label.toLowerCase();
    }
    static async getActivePreviewType(editor, dontAsk = false) {
        if (!editor && !!vscode.window.activeTextEditor) {
            editor = vscode.window.activeTextEditor;
        }
        if (!editor || !editor.document) {
            return Promise.resolve("none");
        }
        switch (editor.document.languageId) {
            case "html":
            case "jade":
            case "pug":
            case "markdown":
            case "css":
            case "mermaid":
            case "rst":
                return Promise.resolve(editor.document.languageId);
            default:
                break;
        }
        if (dontAsk) {
            return Promise.resolve(editor.document.languageId);
            // throw new Error("Couldn't determine type to preview, and the extension don't let show choose box.");
        }
        //Ask what they want to do:
        return Promise.resolve(VscodeHelper.getPreviewTypeQuickPick());
    }
    ;
    static getTextEditor(docUri) {
        if (!docUri) {
            return;
        }
        let editor = null;
        for (const e of vscode.window.visibleTextEditors) {
            if (e.document.uri.toString() === docUri.toString()) {
                editor = e;
                break;
            }
        }
        if (!editor || !editor.document) {
            return;
        }
        return editor;
    }
}
//# sourceMappingURL=vscodeHelper.js.map