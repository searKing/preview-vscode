//@ts-check

'use strict';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');

/** @typedef {import('webpack').Configuration} WebpackConfig **/

/**
 * @param {{ mode?: 'development' | 'production' }} argv
 * @param {{ entry: string, out: string, target: 'node' | 'web' | 'webworker', library?: 'commonjs' | 'module' | false, polyfills?: string[] }} options
 * @returns {WebpackConfig}
 */
const makeConfig = (argv, { entry, out, target, library = 'commonjs', polyfills = [], asyncChunks = false }) => ({
  context: __dirname,
  target, // 📖 -> https://webpack.js.org/configuration/target/
  node: {
    global: true,
    __filename: false,
    __dirname: false,
  },
  mode: argv.mode,
  entry: {
    extension: {
      import: entry,
    }
  },
  output: {
    path: path.join(__dirname, path.dirname(out)),
    filename: path.basename(out),
    // lazily loaded chunks are next to the entry script, not the webview page.
    publicPath: asyncChunks ? 'auto' : '',
    clean: true,
    ...(library ? { library: { type: library }, chunkFormat: library } : {}),
    asyncChunks,
  },
  externals: {
    // the vscode-module is created on-the-fly and must be excluded, 📖 -> https://webpack.js.org/configuration/externals/
    vscode: 'commonjs vscode',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    // pug depends on fs, it is required lazily and falls back to showing the source in the browser.
    alias: target === 'node' ? {} : { pug: false },
  },
  experiments: {
    outputModule: library === 'module',
  },
  optimization: {
    minimize: argv.mode !== 'development',
  },
  // bundles are loaded from the local disk, not the network.
  performance: { hints: false },
  module: {
    rules: [
      {
        // the polyfills are injected without file extension, which ESM requires.
        test: /\.m?js$/,
        resolve: { fullySpecified: false },
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          configFile: path.join(path.dirname(entry), 'tsconfig.json'),
          // type checking is done by ForkTsCheckerWebpackPlugin
          transpileOnly: true,
          compilerOptions: {
            noEmit: false,
          },
        },
      },
    ]
  },
  devtool: 'nosources-source-map',
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.join(path.dirname(entry), 'tsconfig.json'),
      },
    }),
    // Since webpack 5, core Node.js modules are no longer polyfilled for the browser.
    ...(polyfills.length > 0 ? [new NodePolyfillPlugin({ onlyAliases: polyfills })] : []),
  ],
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
});

/** @param {unknown} _env @param {{ mode?: 'development' | 'production' }} argv */
module.exports = (_env, argv) => [
  makeConfig(argv, { entry: './src/notebook/notebook.ts', out: './dist/notebook/notebook.js', target: 'web', library: 'module' }),
  // mermaid loads its diagrams lazily, chunks get the preview's CSP nonce, see src/preview/nonce.ts.
  makeConfig(argv, { entry: './src/preview/index.ts', out: './dist/preview/index.js', target: 'web', library: false, asyncChunks: true }),
  makeConfig(argv, { entry: './src/extension/extension.ts', out: './dist/extension/node/extension.js', target: 'node' }),
  makeConfig(argv, { entry: './src/extension/extension.ts', out: './dist/extension/browser/extension.js', target: 'webworker', polyfills: ['path', 'process'] }),
];
