import { Shell } from "./shell";

export class Docutils {

    private static docutils(command: string, fileName: string): Promise<string> {
        return Shell.execPromisLike([
            command,
            "\"" + fileName + "\""
        ].join(" "));
    }

    public static buildhtml(fileName: string): Promise<string> {
        return this.docutils("buildhtml.py", fileName);
    }
    public static rst2html(fileName: string): Promise<string> {
        return this.docutils("rst2html.py", fileName);
    }
    public static rst2html5(fileName: string): Promise<string> {
        return this.docutils("rst2html5.py", fileName);
    }
    public static rst2latex(fileName: string): Promise<string> {
        return this.docutils("rst2latex.py", fileName);
    }
    public static rst2man(fileName: string): Promise<string> {
        return this.docutils("rst2man.py", fileName);
    }
    public static rst2odt(fileName: string): Promise<string> {
        return this.docutils("rst2odt.py", fileName);
    }
    public static rst2odt_prepstyles(fileName: string): Promise<string> {
        return this.docutils("rst2odt_prepstyles.py", fileName);
    }
    public static rst2pseudoxml(fileName: string): Promise<string> {
        return this.docutils("rst2pseudoxml.py", fileName);
    }
    public static rst2s5(fileName: string): Promise<string> {
        return this.docutils("rst2s5.py", fileName);
    }
    public static rst2xetex(fileName: string): Promise<string> {
        return this.docutils("rst2xetex.py", fileName);
    }
    public static rst2xml(fileName: string): Promise<string> {
        return this.docutils("rst2xml.py", fileName);
    }
    public static rstpep2html(fileName: string): Promise<string> {
        return this.docutils("rstpep2html.py", fileName);
    }
}