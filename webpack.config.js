//@ts-check

'use strict';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { DefinePlugin } = require('webpack');
const path = require('path');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

// /** @type WebpackConfig */
const makeConfig = (argv, { entry, out, target, library = 'commonjs' }) => ({
  context: __dirname,
  target,//: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  node: {
    global: true,
    __filename: false,
    __dirname: false,
  },
  mode: argv.mode,//'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  entry: {
    extension: {
      import: entry,
    }
  },//: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.join(__dirname, path.dirname(out)),
    // filename: '[name].[contenthash].js',
    // filename: path.basename(out),
    filename: '[name].js',
    chunkFilename: '[id].[chunkhash].js',
    publicPath: '',
    libraryTarget: library,
    chunkFormat: library,
  },
  // externalsType: "script",
  externals: {
    vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
    path: 'path',
    fs: 'fs',
    assert: 'assert',
    domain: 'domain',
    os: 'os',
    process: 'process'
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
  },
  experiments: {
    outputModule: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  // performance: { hints: false },
  module: {
    rules: [
      // Allow importing ts(x) files:
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          configFile: path.join(path.dirname(entry), 'tsconfig.json'),
          // transpileOnly enables hot-module-replacement
          transpileOnly: true,
          compilerOptions: {
            // Overwrite the noEmit from the client's tsconfig
            noEmit: false,
          },
        },
      },
      // Allow importing CSS modules:
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
      }
    ]
  },
  devtool: 'nosources-source-map',
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.join(path.dirname(entry), 'tsconfig.json'),
      },
    }),
    new DefinePlugin({
      // Path from the output filename to the output directory
      __webpack_relative_entrypoint_to_root__: JSON.stringify(
        path.posix.relative(path.posix.dirname(`/index.js`), '/'),
      ),
      scriptUrl: 'import.meta.url',
    }),
    // Starting with v5, webpack no longer automatically pollyfills core Node.js modules.
    // If you have code that depends on modules such as fs, path, and etc, 
    // or you have dependencies that require these module, 
    // your code will break when you use or upgrade to web pack 5+. 
    // On the one hand, it makes sense not to always include these backend centric modules, 
    // but on the other hand, it can quite annoying! Fortunately, it is quite easy to fix.
    // Simply install the packages that do the required pollyfill manually under webpack.config.js’s resolve.fallback configs.
    // See the example in webpack’s documentation:
    // https://webpack.js.org/configuration/resolve/?source=post_page-----9e7979125aac--------------------------------#resolvefallback
    // https://feixie1980.medium.com/fixing-node-js-modules-pollyfill-in-webpack-5-9e7979125aac
    new NodePolyfillPlugin({
      excludeAliases: ['console', 'Buffer']
    }),
    // https://webpack.js.org/guides/code-splitting/
    new HtmlWebpackPlugin({
      title: 'Caching',
    }),
    // https://github.com/gregnb/filemanager-webpack-plugin
  ],
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
});
module.exports = (env, argv) => [
  makeConfig(argv, { entry: './src/notebook/index.ts', out: './dist/notebook/index.js', target: 'web', library: 'module' }),
  makeConfig(argv, { entry: './src/extension/extension.ts', out: './dist/extension/extension.js', target: 'node' }),
  makeConfig(argv, { entry: './src/extension/extension.ts', out: './dist/extension/extension.web.js', target: 'webworker' }),
];