// Smoke test for renderer using Node + JSDOM
// Run: npm install --save-dev jsdom
// Then: node test/smoke.test.js

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { JSDOM } = require('jsdom');

async function waitFor(predicate, { timeout = 2000, interval = 50 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (predicate()) return;
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error('Timed out waiting for predicate');
}

(async function main() {
  try {
    const repoRoot = path.resolve(__dirname, '..');
    const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
    const scriptJs = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');
    const eventsJson = fs.readFileSync(path.join(repoRoot, 'events.json'), 'utf8');

    const dom = new JSDOM(indexHtml, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/'
    });

    // Provide a fetch implementation that returns the sample events.json
    dom.window.fetch = async () => ({
      ok: true,
      json: async () => JSON.parse(eventsJson)
    });

    // Evaluate the renderer script in the JSDOM window
    dom.window.eval(scriptJs);

    // Wait for renderer to populate repository cards
    await waitFor(() => dom.window.document.querySelectorAll('.repository-card').length > 0, {
      timeout: 3000,
      interval: 50
    });

    const cards = dom.window.document.querySelectorAll('.repository-card');
    assert(cards.length > 0, 'Expected at least one .repository-card');

    console.log('Smoke test passed — renderer produced', cards.length, 'card(s)');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(1);
  }
})();
