// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MarkdownIt = require('markdown-it');
import { VscodeHelper } from './util/vscodeHelper';

export namespace MarkdownItFencedFile {
    const markdownFencedFileSetting = 'markdown.fenced-file';

    // This method is called when your extension is activated
    // Your extension is activated the very first time the command is executed
    export function extendMarkdownIt(context: vscode.ExtensionContext | undefined, md: MarkdownIt): MarkdownIt {
        if (!!context) {
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(markdownFencedFileSetting)) {
                    vscode.commands.executeCommand('markdown.api.reloadPlugins');
                }
            }, undefined, context.subscriptions);
        }

        const config = vscode.workspace.getConfiguration('markdown');
        if (!config.get<boolean>('fenced-file.enabled', true)) {
            return md;
        }
        return md.use(fenced_file_render, {});
    }

    const fenced_file_render = (md: MarkdownIt): void => {
        md.core.ruler.before('normalize', 'fenced-file', (state): void => {
            let languageId: string = VscodeHelper.activeLanguageId();
            if (!languageId) {
                return;
            }
            switch (languageId) {
                case "markdown":
                    state.src = '```markdown\n' + `${state.src}` + '\n```';
                    break;
                case "html": case "css":
                    state.src = '```html\n' + `${state.src}` + '\n```';
                    break;
                case "mermaid":
                    state.src = '```mermaid\n' + `${state.src}` + '\n```';
                    break;
                case "restructuredtext":
                    state.src = '```rst\n' + `${state.src}` + '\n```';
                    break;
                case "jade": case "pug":
                    state.src = '```pug\n' + `${state.src}` + '\n```';
                    break;
            }
            // const label = vscode.window.tabGroups.activeTabGroup.activeTab?.label;
            // if (label?.endsWith('.html')) {
            //     state.src += '```html\n' + `${state.src}` + '\n```';
            // }
        });
    };
}


