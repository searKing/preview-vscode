// markdown-it plugins without type declarations.

declare module 'markdown-it-abbr' {
    const plugin: import('markdown-it').PluginSimple;
    export default plugin;
}

declare module 'markdown-it-cjk-breaks' {
    const plugin: import('markdown-it').PluginSimple;
    export default plugin;
}

declare module 'markdown-it-deflist' {
    const plugin: import('markdown-it').PluginSimple;
    export default plugin;
}

declare module 'markdown-it-emoji' {
    export const full: import('markdown-it').PluginWithOptions;
}

declare module 'markdown-it-expand-tabs' {
    const plugin: import('markdown-it').PluginWithOptions<{ tabWidth?: number }>;
    export default plugin;
}

declare module 'markdown-it-footnote' {
    const plugin: import('markdown-it').PluginSimple;
    export default plugin;
}

declare module 'markdown-it-ins' {
    const plugin: import('markdown-it').PluginSimple;
    export default plugin;
}

declare module 'markdown-it-lazy-headers' {
    const plugin: import('markdown-it').PluginSimple;
    export default plugin;
}

declare module 'markdown-it-mark' {
    const plugin: import('markdown-it').PluginSimple;
    export default plugin;
}

declare module 'markdown-it-sub' {
    const plugin: import('markdown-it').PluginSimple;
    export default plugin;
}

declare module 'markdown-it-sup' {
    const plugin: import('markdown-it').PluginSimple;
    export default plugin;
}
