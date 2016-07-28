# preview-vscode

A previewer of Markdown, ReStructured Text, HTML, Jade, Mermaid files, Image's URI or CSS properties for Visual Studio Code

# README

An extension to preview Markdown, ReStructured Text, HTML, Jade or Mermaid files, Image's URI or CSS while editing them in VSCode

The extension can be activated in two ways

* Toggle Preview - `ctrl+shift+v`
* Open|Close Preview to the Side - `ctrl+k v`

Just press the same key when you want to go back to the original view.

## DETAIL

+ If file type is Markdown, ReStructured Text, HTML, Jade or Mermaid
    - Just do as the operation as mentioned.
+ If file type is CSS
    - Just click on a CSS property between{}
    - Just do as the operation as mentioned.
+ If file type is other
    - Just click on a 
        * image URI (/http[s]{0,1}:\/\/|file:\/\/|\s[\.]{0,2}\//).
            * for example: http://, https://, file://, /, ./
        * css properities ({})
            * for example: {color: blue}
        * others as Markdown, ReStructured Text, HTML, Jade or Mermaid
            * for ReStructured Text, docutils is the first choice, and rst2mdown is plan B.
                * [python](https://www.python.org/)
                * [doctuils](http://docutils.sourceforge.net/)
    - Just do as the operation as mentioned and a showQuickPick will pop up to show choices.
    - ![Demonstration](images/demonstration.gif)

## Note

JavaScript code does not run in the previewer

## Contributing

+ If you want to develop and debug this extension from source code, and run 'npm install' under the root dir of this extension,

+ Cannot find module 'vscode'? Please run 'npm run postinstall ' under the root dir of this extension,
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

+ Meet NPM problem: npm ERR! extraneous when you run npm list? Please run 'npm prune' to clean unneeded packages,
according to [NPM problem: npm ERR! extraneous](http://lifeonubuntu.com/npm-problem-npm-err-extraneous/)

+ 'vsce publish' failed?
```bash
Executing prepublish script 'node ./node_modules/vscode/bin/compile'...
Error: Command failed: node ./node_modules/vscode/bin/compile
```
    - execute this command and you will get the error message in the console
```bash
npm run vscode:prepublish
```
    - fix the error and retry 'vsce publish'
## Thanks to

+ [html-preview-vscode](https://github.com/tht13/html-preview-vscode.git).

+ [vscode-imagepreview](https://github.com/buzzfrog/vscode-imagepreview.git).

+ [vscode-mermaid-preview](https://github.com/vstirbu/vscode-mermaid-preview.git).