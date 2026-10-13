// The preview inserts the rendered content with DOMParser, so its <script> never runs, even if the
// preview security is "Disable" (allow all content and script execution), see #108.
// Run them only then: the CSP of other security levels blocks them anyway, recreated scripts get no nonce.

const SCRIPT_TYPES = ['', 'text/javascript', 'application/javascript', 'module'];

// The source each script was last run with, a script is run again when it is edited.
const executed = new WeakMap<HTMLScriptElement, string>();

function scriptsAllowed(): boolean {
    const csp = document.querySelector('head > meta[http-equiv="Content-Security-Policy"]');
    return !csp || !csp.getAttribute('content')?.trim();
}

async function runScripts() {
    for (const script of Array.from(document.querySelectorAll<HTMLScriptElement>('.markdown-body script'))) {
        if (!script.isConnected || !SCRIPT_TYPES.includes(script.type.trim().toLowerCase())) {
            continue;
        }
        const source = `${script.src}\n${script.text}`;
        if (executed.get(script) === source) {
            continue;
        }
        const clone = document.createElement('script');
        for (const attribute of Array.from(script.attributes)) {
            clone.setAttribute(attribute.name, attribute.value);
        }
        // A created script is async by default, and `script.async` of a DOMParser one is true too.
        clone.async = script.hasAttribute('async');
        clone.text = script.text;
        executed.set(clone, source);
        // Like a page load, later scripts wait for a blocking external one.
        const loaded = clone.src && !clone.async && !clone.defer && clone.type !== 'module'
            ? new Promise((resolve) => { clone.onload = clone.onerror = resolve; })
            : undefined;
        script.replaceWith(clone);
        await loaded;
    }
}

if (scriptsAllowed()) {
    let pending = false;
    let running = Promise.resolve();
    const schedule = () => {
        if (!pending) {
            pending = true;
            running = running.then(() => {
                pending = false;
                return runScripts();
            });
        }
    };
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    schedule();
}

export { };
