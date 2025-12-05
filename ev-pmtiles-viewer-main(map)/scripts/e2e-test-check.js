#!/usr/bin/env node

/**
 * E2E Test Check - Playwright Test Runner with Reporting
 * Integrates with existing quality workflow
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function checkPlaywrightInstalled() {
  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function runTests() {
  log('\n🎭 Running Playwright E2E Tests...', COLORS.blue);

  if (!checkPlaywrightInstalled()) {
    log('❌ Playwright not installed', COLORS.red);
    log('Run: npm install -D @playwright/test', COLORS.yellow);
    process.exit(1);
  }

  try {
    execSync('npx playwright test', {
      stdio: 'inherit',
      env: { ...process.env, CI: 'false' },
    });

    log('\n✅ All E2E tests passed!', COLORS.green);

    if (existsSync('playwright-report/index.html')) {
      log(
        '\n📊 Test report available: playwright-report/index.html',
        COLORS.blue
      );
    }

    return true;
  } catch (error) {
    log('\n❌ E2E tests failed', COLORS.red);
    log('\nRun with --headed to debug: npm run test:e2e:headed', COLORS.yellow);
    log('Or use UI mode: npm run test:e2e:ui', COLORS.yellow);
    return false;
  }
}

const success = runTests();
process.exit(success ? 0 : 1);
