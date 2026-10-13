// Renders the samples in test-workspace like the preview of them.
const { test } = require('node:test');
const { render } = require('./extension.cjs');
const { assertSnapshot, readSample, samples } = require('./snapshot.cjs');

for (const name of samples('.md', '.html', '.css', '.mermaid', '.rst', '.jade', '.pug')) {
	test(`render ${name}`, () => {
		assertSnapshot(`render/${name}.html`, render(name, readSample(name)));
	});
}
