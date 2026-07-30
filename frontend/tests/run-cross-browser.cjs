const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

const localWindowsRuntime = resolve(__dirname, '..', 'test-results', 'runtime', 'vclibs');
if (process.platform === 'win32' && existsSync(localWindowsRuntime)) {
  process.env.PATH = `${localWindowsRuntime};${process.env.PATH || ''}`;
  process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = 'true';
}

process.env.PLAYWRIGHT_CONFIG = 'playwright.cross-browser.config.ts';
process.argv.push('tests/visual-folder-regressions.spec.ts', 'tests/multi-user-concurrency.spec.ts');
require('./run-external-server.cjs');
