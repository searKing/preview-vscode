# preview-vscode

A Previewer of Markdown, ReStructured Text, HTML, Jade, Pug, Mermaid files, Image's URI for Visual Studio Code

## README

An extension to preview Markdown, ReStructured Text, HTML, Jade, Pug or Mermaid files or Image's URI while editing them in VSCode

The extension can be activated in two ways

* Toggle Preview
  * Linux & Windows: `ctrl+shift+v`
  * MAC:`cmd+shift+v` or `ctrl+shift+v`
* Open|Close Preview to the Side
  * Linux & Windows: `ctrl+k v`
  * MAC:`cmd+k v` or `ctrl+k v`

Just press the same key when you want to go back to the original view.

## DETAIL

* If file type is Markdown, ReStructured Text, HTML, Jade, Pug or Mermaid
  * Just do as the operation as mentioned.
* If file type is other
  * Just click on a  
    * image URI (/http[s]{0,1}:\/\/|file:\/\/|\s[\.]{0,2}\//).
      * for example: http://, https://, file://, /, ./
    * css properities ({})
      * for example: {color: blue}
    * others as Markdown, ReStructured Text, HTML, Jade or Mermaid
    * Just do as the operation as mentioned and a showQuickPick will pop up to show choices.
* Scripts in the previewed page, e.g. `<script>` of an HTML file, only run when the preview security is `Disable` (`Markdown: Change Preview Security Settings`), do it only for files you trust.
    * ![Demonstration](media/demonstration.gif)

## Contributing

* Develop and debug

    ```bash
    npm install
    npm run watch   # or `npm run compile` once, then press F5 in VS Code to launch the Extension Development Host
    npm run lint
    ```

* Layout
  * `src/extension`: extension entry, contributes the markdown-it plugins to the built-in Markdown preview.
  * `src/renders`: markdown-it plugins, simple third-party plugins are configured in `src/renders/markdown-it-plugins.ts`.
  * `src/preview`: script loaded into the preview by `markdown.previewScripts`, renders Mermaid diagrams and the code copy button.
  * `src/notebook`: notebook renderer, extends `vscode.markdown-it-renderer`.
  * `syntaxes/markdown.tmLanguage.json`: VS Code's builtin Markdown grammar, patched so indented lines are highlighted as Markdown rather than code, and front matter in Markdown code blocks is highlighted as YAML.
  * `syntaxes/shell.tmLanguage.json`: VS Code's builtin shell grammar, used by shell code blocks in Markdown and patched so commands in list items are highlighted too.
  * Regenerate both with `npm run update-syntaxes [VS Code extensions directory]` (defaults to the latest `microsoft/vscode` main, honors `HTTPS_PROXY`, requires Node.js 24.5+), which also syncs the grammar contribution in `package.json`.
  * `test-workspace`: sample files to preview.

* Notes
  * The preview only runs scripts carrying its CSP nonce, so inline `<script>` in rendered Markdown never runs with the default security settings, use `src/preview` instead. With the preview security `Disable`, `src/preview/scripts.ts` runs them, as VS Code inserts the content with `DOMParser`, which never runs scripts.
  * Every setting in `contributes.configuration` reloads the markdown-it plugins when it changes.
  * `@types/vscode` must not be newer than `engines.vscode`.

* Package and publish, see [publishing-extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

    ```bash
    npm run dist           # pre-release package, `npm run dist:stable` for stable
    npm run vscode:publish # pre-release publish, `npm run vscode:publish:stable` for stable
    ```

## Thanks to

* [html-preview-vscode](https://github.com/tht13/html-preview-vscode.git).

* [vscode-imagepreview](https://github.com/buzzfrog/vscode-imagepreview.git).

* [vscode-mermaid-preview](https://github.com/vstirbu/vscode-mermaid-preview.git).