# Change Log

All notable changes to the "preview-vscode" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Fix: the Markdown grammar is regenerated from the VS Code 1.141 builtin grammar by `npm run update-syntaxes`, so fenced `jsonl`, `restructuredtext`, `abap`, `yang` blocks are highlighted and strikethrough follows upstream, while indented lines are still highlighted as Markdown ([#96](https://github.com/searKing/preview-vscode/issues/96)).
- Fix: bracket pair colorization no longer matches `=>`, `<`, `<<`, ... in C# and TypeScript code blocks, the grammar contribution declares the same embedded languages and unbalanced bracket scopes as the builtin one.
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