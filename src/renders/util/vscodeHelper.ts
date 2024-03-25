import * as vscode from "vscode";

export class VscodeHelper {
    // token or gist input
    public static getInputBox(boxTag: string) {
        if (!boxTag || boxTag === "") {
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

    public static activeLanguageId(): string {
        let id = vscode.window.activeTextEditor?.document.languageId;
        if (!!id) {
            return id;
        }
        let ext = vscode.window.tabGroups.activeTabGroup.activeTab?.label.split('.').pop();
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

    public static async getActivePreviewType(editor: vscode.TextEditor, dontAsk: boolean = false): Promise<string> {
        if (!editor && !!vscode.window.activeTextEditor) {
            editor = vscode.window.activeTextEditor;
        }

        if (!editor || !editor.document) {
            return Promise.resolve("none");
        }
        switch (editor.document.languageId) {
            case "markdown":
            case "html":
            case "css":
            case "mermaid":
            case "restructuredtext":
            case "jade":
            case "pug":
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
    };
}