# Change Log

All notable changes to the "preview-vscode" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Fix: preview type is detected from the document being rendered, so a Markdown preview is no longer rendered as HTML/Mermaid/... after another file was opened, and live updates of non-Markdown previews keep their type.
- Fix: setting listeners are registered only once instead of on every plugin reload.
- Fix: changing `markdown.code-copy.*`, `markdown.indented-code.*`, `markdown.file-uri.*` now reloads the preview.
- Add: `markdown.fenced-file.enabled` setting.
- Fix: Mermaid diagrams and the code copy button work with the default preview security, they no longer load scripts from CDN but are bundled and contributed by `markdown.previewScripts`.
- Fix: Mermaid diagrams are rendered in notebook Markdown cells.
- Fix: Pug blocks are rendered as HTML instead of the compiled template function source.
- Fix: "Open Locked Preview to the Side" opens a locked preview; previewing a file from the explorer no longer opens and closes an editor first.
- Fix: image URI lookup under the cursor no longer slows down on large files.
- Fix: previewing multiple selected files opens them one by one.
- Fix: usage events are no longer printed to the extension host log.
- Chore: migrate to ESLint 9 flat config, so `npm run lint` / `npm test` work again; remove dead code.

## Initial release