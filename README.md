# preview-vscode

A previewer of Markdown, ReStructured Text, HTML, Jade, Pug, Mermaid files, Image's URI or CSS properties for Visual Studio Code

# README

An extension to preview Markdown, ReStructured Text, HTML, Jade, Pug or Mermaid files, Image's URI or CSS while editing them in VSCode

The extension can be activated in two ways

* Toggle Preview
    - Linux & Windows: `ctrl+shift+v`
    - MAC:`cmd+shift+v` or `ctrl+shift+v`
* Open|Close Preview to the Side
    - Linux & Windows: `ctrl+k v`
    - MAC:`cmd+k v` or `ctrl+k v`

Just press the same key when you want to go back to the original view.

## DETAIL

+ If file type is Markdown, ReStructured Text, HTML, Jade, Pug or Mermaid
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
                * [doctutils](http://docutils.sourceforge.net/)
    - Just do as the operation as mentioned and a showQuickPick will pop up to show choices.
    - ![Demonstration](images/demonstration.gif)

## Note

python and docutils are recommended to be installed to Preview ReStructured Text to preview the rst more accurately.

## Contributing

+ If you want to develop and debug this extension from source code, and run 'npm install' under the root dir of this extension,

+ npm packages vscode and typescript is needed as an environment
    ```bash
    npm install vscode
    npm install typescript
    ```

+ Cannot find module 'vscode'? Please run 'npm run postinstall' under the root dir of this extension,
according to [Cannot find module 'vscode' – where is vscode.d.ts now installed? #2810](https://github.com/Microsoft/vscode/issues/2810)

+ Cannot find module 'console'? Please run 'npm install @types/node' under the root dir of this extension,
according to [Node projects with --lib es6: cannot find name 'console' #9545](https://github.com/Microsoft/TypeScript/issues/9545)

+ Node.js's version is too old ? following this two ways, choose one:
    - [NodeSource Node.js Binary Distributions](https://github.com/nodesource/distributions), and you will get the latest version installed automatically !
    - install n to maintain the version
        * install module n

            ```bash
            sudo npm install -g n
            ```

        * update Node.js
             * latest stable version

                ```bash
                sudo n stable
                ```

             * any version

                ```bash
                sudo n 7.6.0
                sudo n v7.6.0
                ```
             * manually update
                * explore for the version you want, [click this to explore->>](https://nodejs.org/download/)
                * download the node file, such as v7.3.0
                    ```bash
                    # Broken-point Continuingly-transferring is supported.
                    wget -c https://nodejs.org/download/release/v7.3.0/node-v7.3.0-linux-x64.tar.gz
                    ```
                * install Node.js, such as v7.3.0
                    ```bash
                    mkdir -p /usr/local/n/versions/node/
                    tar -zxvf node-v7.3.0-linux-x64.tar.gz 7.3.0/
                    ln -sf /usr/local/n/versions/node/7.3.0/bin/node /usr/bin/node
                    ```
+ Node Package's version is too old? following this way:
    - install module npm-check
        ```bash
        npm install -g npm-check
        ```
    - check for installed npm packages's version
        ```bash
        # set flag -g for global packages, else for local packages
        npm-check -u
        ```
    - do as npm-check tells

+ Meet NPM problem: npm ERR! extraneous when you run npm list? Please run 'npm prune -x' to clean unneeded packages,
according to [NPM problem: npm ERR! extraneous](http://lifeonubuntu.com/npm-problem-npm-err-extraneous/)

+ 'vsce publish' failed?
    ```info
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