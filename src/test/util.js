/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as os from 'os';
export const joinLines = (...args) => args.join(os.platform() === 'win32' ? '\r\n' : '\n');
//# sourceMappingURL=util.js.map