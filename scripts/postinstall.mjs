import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { installPlaywrightLocalBrowsers } from './playwright-install.mjs';

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

try {
  const prismaCli = path.resolve('node_modules', 'prisma', 'build', 'index.js');
  if (existsSync(prismaCli)) {
    run(process.execPath, [prismaCli, 'generate']);
  }

  if (process.env.SKIP_PLAYWRIGHT_DOWNLOAD === '1') {
    process.exit(0);
  }

  const playwrightCli = path.resolve('node_modules', 'playwright', 'cli.js');
  if (existsSync(playwrightCli)) {
    installPlaywrightLocalBrowsers();
  }
} catch (error) {
  console.error('[postinstall] Failed:', error instanceof Error ? error.message : error);
  process.exit(1);
}
