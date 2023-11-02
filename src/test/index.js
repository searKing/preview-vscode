/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const options = {
    ui: 'tdd',
    useColors: (!process.env.BUILD_ARTIFACTSTAGINGDIRECTORY && process.platform !== 'win32'),
    timeout: 60000
};
// These integration tests is being run in multiple environments (electron, web, remote)
// so we need to set the suite name based on the environment as the suite name is used
// for the test results file name
let suite = '';
if (process.env.VSCODE_BROWSER) {
    suite = `${process.env.VSCODE_BROWSER} Browser Integration Markdown Tests`;
}
else if (process.env.REMOTE_VSCODE) {
    suite = 'Remote Integration Markdown Tests';
}
else {
    suite = 'Integration Markdown Tests';
}
if (process.env.BUILD_ARTIFACTSTAGINGDIRECTORY) {
    options.reporter = 'mocha-multi-reporters';
    const path = require('path');
    options.reporterOptions = {
        reporterEnabled: 'spec, mocha-junit-reporter',
        mochaJunitReporterReporterOptions: {
            testsuitesTitle: `${suite} ${process.platform}`,
            mochaFile: path.join(process.env.BUILD_ARTIFACTSTAGINGDIRECTORY, `test-results/${process.platform}-${process.arch}-${suite.toLowerCase().replace(/[^\w]/g, '-')}-results.xml`)
        }
    };
}
let testRunner_ = require('vscode/lib/testrunner');
testRunner_.configure(options);
export let testRunner = testRunner_;
//# sourceMappingURL=index.js.map