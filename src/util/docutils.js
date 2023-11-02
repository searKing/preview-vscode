import { Shell } from "./shell";
export class Docutils {
    static docutils(command, fileName) {
        return Shell.execPromisLike([
            command,
            "\"" + fileName + "\""
        ].join(" "));
    }
    static buildhtml(fileName) {
        return this.docutils("buildhtml.py", fileName);
    }
    static rst2html(fileName) {
        return this.docutils("rst2html.py", fileName);
    }
    static rst2html5(fileName) {
        return this.docutils("rst2html5.py", fileName);
    }
    static rst2latex(fileName) {
        return this.docutils("rst2latex.py", fileName);
    }
    static rst2man(fileName) {
        return this.docutils("rst2man.py", fileName);
    }
    static rst2odt(fileName) {
        return this.docutils("rst2odt.py", fileName);
    }
    static rst2odt_prepstyles(fileName) {
        return this.docutils("rst2odt_prepstyles.py", fileName);
    }
    static rst2pseudoxml(fileName) {
        return this.docutils("rst2pseudoxml.py", fileName);
    }
    static rst2s5(fileName) {
        return this.docutils("rst2s5.py", fileName);
    }
    static rst2xetex(fileName) {
        return this.docutils("rst2xetex.py", fileName);
    }
    static rst2xml(fileName) {
        return this.docutils("rst2xml.py", fileName);
    }
    static rstpep2html(fileName) {
        return this.docutils("rstpep2html.py", fileName);
    }
}
//# sourceMappingURL=docutils.js.map