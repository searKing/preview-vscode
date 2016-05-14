# preview-vscode

A previewer of Markdown, HTML, Jade files, Image's URI or CSS properties for Visual Studio Code
# README

An extension to preview Markdown, HTML or Jade files, Image's URI or CSS while editing them in VSCode

The extension can be activated in two ways

* Toggle Preview - `ctrl+shift+v`
* Open|Close Preview to the Side - `ctrl+k v`

Just press the same key when you want to go back to the original view.

## DETAIL

+ If file type is Markdown, HTML or Jade
    - Just do as the operation as mentioned.
+ If file type is CSS
    - Just click on a CSS property between{}
    - Just do as the operation as mentioned.
+ If file type is other
    - Just click on a image URI (/http[s]{0,1}:\/\/|file:\/\/|\s[\.]{0,2}\//).
        * for example: http://, https://, file://, /, ./
    - Just do as the operation as mentioned.

## Note

JavaScript code does not run in the previewer

## Contributing

+ If you want to develop and debug this extension from source code, and run 'npm install' under the root dir of this extension,

+ Cannot find module 'vscode'? Please run 'sudo npm run postinstall ' under the root dir of this extension,
according to [Cannot find module 'vscode' – where is vscode.d.ts now installed? #2810](https://github.com/Microsoft/vscode/issues/2810)

+ Node.js's version is too old ? following this two ways, choose one:
    - [NodeSource Node.js Binary Distributions](https://github.com/nodesource/distributions), and you will get the latest version installed automatically !
    - install n to maintain the version
        * install module n
```bash
sudo npm install -g n
```
        * update Node.js to latest stable version
```bash
sudo n stable
```
        * update Node.js to any version
```bash
sudo n 6.0.0
sudo n v6.0.0
```

## Thanks to

+ [html-preview-vscode](https://github.com/tht13/html-preview-vscode.git).
+ [vscode-imagepreview](https://github.com/buzzfrog/vscode-imagepreview.git).