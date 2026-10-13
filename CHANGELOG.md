# Change Log

All notable changes to the "preview-vscode" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Perf: mermaid is loaded on demand in the preview and notebook Markdown cells, only when there are diagrams. The preview script shrinks from 740 KB to 7 KB, the notebook renderer from 6.3 MB to 1.2 MB.
- Fix: mermaid diagrams are rendered when the preview appends its content after the preview script runs, e.g. when reopening or refreshing the preview, they could stay as source.
- Add: the message asking to reload the window after the fenced code highlighting changed is translated to Chinese, runtime strings are localized with `vscode.l10n` (`l10n/bundle.l10n.zh-cn.json`).
- Chore: publish to [Open VSX](https://open-vsx.org/) too (`npm run ovsx:publish`), for VSCodium, Cursor, Gitpod, ...; add the `license` and `keywords` of the extension, and `@vscode/vsce` and `ovsx` as dev dependencies.
- Test: `npm run test:unit` renders the samples in `test-workspace` like the preview and tokenizes the Markdown samples with the grammars, compared with snapshots, it runs in CI.
- Chore: GitHub Actions lint and package every push and pull request, and publish a pushed `v*` tag to the VS Code Marketplace and Open VSX with a GitHub release.

## [2.4.1] - 2026-10-13

- Fix: the Markdown grammar is regenerated from the VS Code 1.141 builtin grammar by `npm run update-syntaxes`, so fenced `jsonl`, `restructuredtext`, `abap`, `yang` blocks are highlighted and strikethrough follows upstream, while indented lines are still highlighted as Markdown ([#96](https://github.com/searKing/preview-vscode/issues/96)).
- Fix: indented lines use the `meta.indented.block.markdown` scope instead of `markup.raw.block.markdown`, so themes that color raw code (e.g. Quiet Light) no longer show indented lists and paragraphs as code ([#96](https://github.com/searKing/preview-vscode/issues/96)).
- Fix: bracket pair colorization no longer matches `=>`, `<`, `<<`, ... in C# and TypeScript code blocks, the grammar contribution declares the same embedded languages and unbalanced bracket scopes as the builtin one.
- Fix: over-indented lines in a list item or block quote are dedented only to the enclosing block, so an indented fence in an HTML table inside a list item is rendered as code instead of breaking the list and the rest of the document ([#106](https://github.com/searKing/preview-vscode/issues/106)).
- Fix: shell code blocks in list items are highlighted in the editor, they use a copy of the builtin shell grammar that also starts a command after the list indent ([#106](https://github.com/searKing/preview-vscode/issues/106)).
- Fix: front matter at the start of a Markdown code block is highlighted as YAML instead of a separator and a heading ([#103](https://github.com/searKing/preview-vscode/issues/103)).
- Add: `markdown.code-wrap.mode` setting, long lines in preview code blocks wrap like `editor.wordWrap` (`auto`, the default and VS Code's behavior), always (`on`) or never (`off`) ([#101](https://github.com/searKing/preview-vscode/issues/101)).
- Add: `file://` URIs in `href` and `src` of raw HTML, e.g. `<link rel="stylesheet" href="file:///...">`, are rewritten to paths relative to the document like Markdown links, so they load in the preview of Markdown and HTML files (`markdown.file-uri.enabled`) ([#99](https://github.com/searKing/preview-vscode/issues/99)).
- Add: `<script>` in the preview runs when the preview security is `Disable` (allow all content and script execution), e.g. scripts of an HTML file setting CSS variables, they never ran because VS Code inserts the content with `DOMParser` ([#108](https://github.com/searKing/preview-vscode/issues/108)).
- Fix: the preview of HTML and CSS files ends with the page, without the extra screen of space added for `editor.scrollBeyondLastLine` ([#108](https://github.com/searKing/preview-vscode/issues/108)).
- Fix: reStructuredText is rendered by [rst-compiler](https://github.com/Trinovantes/rst-compiler) instead of being converted to Markdown, so links, directives (`note`, `code-block`, ...), literal blocks, tables, enumerated lists, images, footnotes and references are rendered. Directives and roles it doesn't know (e.g. Sphinx's `toctree`, `:ref:` to other documents) are shown as source or text, and the `rst2mdown` dependency is removed ([#111](https://github.com/searKing/preview-vscode/issues/111)).
- Add: `markdown.rst.esbonio.enabled` setting (off by default), previewing reStructuredText of a Sphinx project (a `conf.py` in the directory of the file or above) opens the preview of [Esbonio](https://marketplace.visualstudio.com/items?itemName=swyddfa.esbonio) (rendered by Sphinx) when it is installed and its language server is running, so the keybindings shared with it open the same preview.
- Add: `markdown.fenced-languages.enabled` setting (on by default), fenced code blocks of languages the built-in Markdown grammar doesn't know, e.g. `desktop`, are highlighted in the editor with the grammars of the installed extensions. The injection grammar is generated from the installed extensions and takes effect after reloading the window ([#100](https://github.com/searKing/preview-vscode/issues/100)).
- Chore: remove the unused indented code injection grammar and the `js-yaml` dev dependency.

## [2.4.0] - 2026-10-13

- Fix: preview type is detected from the document being rendered, so a Markdown preview is no longer rendered as HTML/Mermaid/... after another file was opened, and live updates of non-Markdown previews keep their type.
- Fix: setting listeners are registered only once instead of on every plugin reload.
- Fix: changing `markdown.code-copy.*`, `markdown.indented-code.*`, `markdown.file-uri.*` now reloads the preview.
- Add: `markdown.fenced-file.enabled` setting.
- Fix: Mermaid diagrams and the code copy button work with the default preview security, they no longer load scripts from CDN but are bundled and contributed by `markdown.previewScripts`.
- Fix: Mermaid diagrams are rendered in notebook Markdown cells.
- Fix: task list items keep inline markup such as footnotes and links instead of duplicating the raw text, in lists and definition lists ([#113](https://github.com/searKing/preview-vscode/issues/113)); `markdown-it-task-lists` is replaced by a built-in rule.
- Chore: switch back to upstream `markdown-it-cjk-breaks` 2.0.1, which includes the fix for `**strong**` followed by a line break ([markdown-it-cjk-breaks#5](https://github.com/markdown-it/markdown-it-cjk-breaks/pull/5)).
- Fix: task list items are styled like GitHub, the checkbox replaces the list marker instead of being shown next to it.
- Fix: Mermaid no longer shows "Syntax error in text" bombs: diagrams use the `preview-vscode-mermaid` class so VS Code's builtin Mermaid extension (which re-renders every `.mermaid` element) leaves them alone, auto rendering on load is disabled, errors are shown in place with the source, and stale renders are dropped.
- Fix: Pug blocks are rendered as HTML instead of the compiled template function source.
- Fix: "Open Locked Preview to the Side" opens a locked preview; previewing a file from the explorer no longer opens and closes an editor first.
- Fix: image URI lookup under the cursor no longer slows down on large files.
- Fix: previewing multiple selected files opens them one by one.
- Fix: usage events are no longer printed to the extension host log.
- Fix: `markdown.tasklists.*` settings take effect, they were read as `markdown.task-lists.*`.
- Perf: the preview script loads only the Mermaid diagram types in use (≈720 KB instead of ≈5 MB at startup).
- Perf: the web extension no longer bundles pug and unused Node.js polyfills; the package no longer ships test files and stale build output.
- Chore: upgrade all dependencies (mermaid 12, markdown-it-anchor 10, markdown-it-attrs 5, markdown-it-deflist 4, TypeScript 6, ESLint 10, webpack-cli 7, ...), remove unused ones.
- Chore: one setting listener for all plugins, simple markdown-it plugins are declared in one place.
- Chore: migrate to ESLint 9 flat config, so `npm run lint` / `npm test` work again; remove dead code.

## Initial release