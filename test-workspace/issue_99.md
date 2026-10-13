<!-- To test locally, copy this file to issue_99.local.md (git ignored) and replace /path/to/preview-vscode
     with the absolute path of this repository:
     sed "s#/path/to/preview-vscode#$PWD#g" test-workspace/issue_99.md > test-workspace/issue_99.local.md -->

<link rel="stylesheet" href="file:///path/to/preview-vscode/test-workspace/issue_99.css">

# The heading is green when issue_99.css is loaded

<div class="issue-99">This box has a dashed green border when issue_99.css is loaded.</div>

## Supported paths

A green check mark is shown when the image is loaded.

| Path | Raw HTML `<img src>` | Markdown image |
|---|---|---|
| `file:///abs/path` | <img src="file:///path/to/preview-vscode/test-workspace/issue_99.svg"> | ![](file:///path/to/preview-vscode/test-workspace/issue_99.svg) |
| `file://localhost/abs/path` | <img src="file://localhost/path/to/preview-vscode/test-workspace/issue_99.svg"> | ![](file://localhost/path/to/preview-vscode/test-workspace/issue_99.svg) |
| `file://LOCALHOST/abs/path` | <img src="file://LOCALHOST/path/to/preview-vscode/test-workspace/issue_99.svg"> | ![](file://LOCALHOST/path/to/preview-vscode/test-workspace/issue_99.svg) |
| `name` (relative, no rewrite needed) | <img src="issue_99.svg"> | ![](issue_99.svg) |
| `./name` | <img src="./issue_99.svg"> | ![](./issue_99.svg) |
| `../dir/name` | <img src="../test-workspace/issue_99.svg"> | ![](../test-workspace/issue_99.svg) |

Links: <a href="file:///path/to/preview-vscode/test-workspace/issue_101.md">raw HTML file:///</a>,
<a href="file://localhost/path/to/preview-vscode/test-workspace/issue_101.md">raw HTML file://localhost/</a>,
[Markdown file:///](file:///path/to/preview-vscode/test-workspace/issue_101.md),
[Markdown file://localhost/](file://localhost/path/to/preview-vscode/test-workspace/issue_101.md).

## Unsupported paths

The part after `file://` is the host, so these are not paths relative to this file and are left unchanged (broken image).

| Path | Raw HTML `<img src>` |
|---|---|
| `file://../dir/name` (host `..`) | <img src="file://../test-workspace/issue_99.svg"> |
| `file://server/share/name` (host `server`) | <img src="file://server/share/issue_99.svg"> |

## Code blocks

An `html` code block is rendered as HTML, so it is rewritten too:

```html
<img src="file:///path/to/preview-vscode/test-workspace/issue_99.svg">
```

Other code blocks are left alone:

```text
<link rel="stylesheet" href="file:///path/to/preview-vscode/test-workspace/issue_99.css">
```
