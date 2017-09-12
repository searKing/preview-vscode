"use strict";

import * as vscode from "vscode";
export class VscodeUtil {

    // token or gist input
    public static getInputBox(boxTag: string) {
        if (!boxTag || boxTag == "") {
            boxTag = "Enter Something";
        }
        let options: vscode.InputBoxOptions = {
            placeHolder: boxTag,
            password: false,
            prompt: "Link is opened to get the github token."
        };
        return options;
    };

    public static async getPreviewTypeQuickPick(): Promise<string> {

        let items: vscode.QuickPickItem[] = [
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
        ]
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

    public static async getActivePreviewType(editor: vscode.TextEditor, dontAsk: boolean = false): Promise<string> {
        if (!editor) {
            editor = vscode.window.activeTextEditor;
        }

        if (!editor || !editor.document) {
            return Promise.resolve("none")
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
        return Promise.resolve(VscodeUtil.getPreviewTypeQuickPick());

    };

    public static getTextEditor(docUri: vscode.Uri): vscode.TextEditor | undefined {
        if (!docUri) {
            return;
        }
        let ss = vscode.window.visibleTextEditors;
        let editor: vscode.TextEditor;
        for (let e of vscode.window.visibleTextEditors) {
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