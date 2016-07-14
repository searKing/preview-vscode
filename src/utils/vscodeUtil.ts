"use strict";

import * as vscode from "vscode";
export class VscodeUtil {

    // token or gist input
    public static getInputBox(boxTag: string) {
        if (boxTag == "") {
            boxTag = "Enter Something";
        }
        let options: vscode.InputBoxOptions = {
            placeHolder: boxTag,
            password: false,
            prompt: "Link is opened to get the github token."
        };
        return options;
    };

    public static getPreviewTypeQuickPick(): PromiseLike<any> {

        let item: vscode.QuickPickItem[] = [
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
        return vscode.window.showQuickPick(item, {
            matchOnDescription: true,
            placeHolder: "Couldn't determine type to preivew, please choose."
        }).then(function (choice) {
            if (!choice || !choice.label) {
                throw new Error("no preview type selected");
            }
            return choice.label.toLowerCase();
        });
    }

    public static getPreviewType(editor: vscode.TextEditor, dontAsk: boolean = false): Promise<string> {
        if (!editor) {
            editor = vscode.window.activeTextEditor;
        }

        switch (editor.document.languageId) {
            case "html":
            case "jade":
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
            // throw new Error("Couldn't determine type to preivew, and the extenion don't let show choose box.");
        }

        //Ask what they want to do:
        return Promise.resolve(VscodeUtil.getPreviewTypeQuickPick());

    };

}