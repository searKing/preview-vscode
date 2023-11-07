/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// import { readFileSync, writeFileSync } from 'fs';

// // Reads dist/node/common/util.js and replaces PACKAGE_JSON_VERSION with the number from the package.json
// import { version } from './package.json';
// const baseUtil = readFileSync('./dist/node/common/util.js', 'utf8');
// const newBaseUtil = baseUtil.replace(/PACKAGE_JSON_VERSION/g, version);
// writeFileSync('./dist/node/common/util.js', newBaseUtil);

// // Reads dist/browser/common/util.js and replaces PACKAGE_JSON_VERSION with the number from the package.json
// const baseUtilBrowser = readFileSync('./dist/browser/common/util.js', 'utf8');
// const newBaseUtilBrowser = baseUtilBrowser.replace(/PACKAGE_JSON_VERSION/g, version);
// writeFileSync('./dist/browser/common/util.js', newBaseUtilBrowser);