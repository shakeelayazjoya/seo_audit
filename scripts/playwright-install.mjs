import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

export function installPlaywrightLocalBrowsers() {
  const playwrightCli = path.resolve('node_modules', 'playwright', 'cli.js');
  if (!existsSync(playwrightCli)) {
    throw new Error('Playwright CLI not found; ensure playwright is installed.');
  }

  run(process.execPath, [playwrightCli, 'install', 'chromium'], {
    PLAYWRIGHT_BROWSERS_PATH: '0',
  });

  console.log('Playwright Chromium installed to local package browser cache.');
}
