#!/usr/bin/env node

/**
 * Production E2E Verification - Post-Deployment Test Suite
 * Runs E2E tests against production URL to verify deployment
 */

import { execSync } from 'child_process';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const PRODUCTION_URL = 'https://vm-neural-01.duckdns.org/pmtiles-viewer/';

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function verifyProduction() {
  log('\n🎭 Running Production E2E Verification...', COLORS.blue);
  log(`🌐 Target: ${PRODUCTION_URL}`, COLORS.blue);

  try {
    execSync(
      `npx playwright test tests/production.spec.js --config=playwright.config.js`,
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          BASE_URL: PRODUCTION_URL,
          CI: 'true',
        },
      }
    );

    log('\n✅ Production deployment verified!', COLORS.green);
    return true;
  } catch (error) {
    log('\n❌ Production verification failed', COLORS.red);
    log('Check playwright-report/index.html for details', COLORS.yellow);
    return false;
  }
}

const success = verifyProduction();
process.exit(success ? 0 : 1);
