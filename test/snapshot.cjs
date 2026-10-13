// Compares with the snapshot files in test/snapshots, `UPDATE_SNAPSHOTS=1 npm run test:unit` writes them.
const assert = require('assert');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repo = path.join(__dirname, '..');

// Samples tracked by git, local and untracked files are not tested.
function samples(...extensions) {
	return execFileSync('git', ['ls-files', 'test-workspace'], { cwd: repo, encoding: 'utf8' })
		.split('\n')
		.filter(file => extensions.includes(path.extname(file)))
		.map(file => path.relative('test-workspace', file));
}

function readSample(name) {
	return fs.readFileSync(path.join(repo, 'test-workspace', name), 'utf8');
}

function assertSnapshot(file, actual) {
	const snapshot = path.join(__dirname, 'snapshots', file);
	if (process.env.UPDATE_SNAPSHOTS) {
		fs.mkdirSync(path.dirname(snapshot), { recursive: true });
		fs.writeFileSync(snapshot, actual);
		return;
	}
	const hint = 'run `UPDATE_SNAPSHOTS=1 npm run test:unit` if it is expected';
	assert.ok(fs.existsSync(snapshot), `no snapshot ${file}, ${hint}`);
	assert.strictEqual(actual, fs.readFileSync(snapshot, 'utf8'), `${file} differs from the snapshot, ${hint}`);
}

module.exports = { assertSnapshot, readSample, samples };
