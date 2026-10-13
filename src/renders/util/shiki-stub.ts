// rst-compiler only reads shiki's language list to label `tabs` code groups, the real shiki
// bundles every grammar (about 10 MB), see the `shiki` alias in webpack.config.js.
export const bundledLanguagesInfo: ReadonlyArray<{ id: string; name: string; aliases?: string[] }> = [];
