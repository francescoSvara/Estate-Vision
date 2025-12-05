#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔒 Running Local Security Checks...\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function run(command, label) {
  console.log(`\n📋 ${label}...`);
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`✅ ${label} - PASSED`);
    checks.passed++;
    return output;
  } catch (error) {
    if (error.status === 0) {
      console.log(`✅ ${label} - PASSED`);
      checks.passed++;
    } else {
      console.log(`❌ ${label} - FAILED`);
      console.log(error.stdout || error.message);
      checks.failed++;
    }
  }
}

function checkSecrets() {
  console.log('\n📋 Checking for hardcoded secrets...');
  const patterns = [
    /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
    /password\s*[:=]\s*['"][^'"]+['"]/gi,
    /secret\s*[:=]\s*['"][^'"]+['"]/gi,
    /token\s*[:=]\s*['"][^'"]+['"]/gi,
    /private[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi
  ];
  
  let found = false;
  const scanDirs = ['src', 'scripts'];
  
  scanDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    
    function scanDirectory(directory) {
      const entries = fs.readdirSync(directory, { withFileTypes: true });
      
      entries.forEach(entry => {
        const fullPath = path.join(directory, entry.name);
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          patterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
              console.log(`⚠️  Possible secret in ${fullPath}`);
              matches.forEach(match => console.log(`   ${match}`));
              found = true;
              checks.warnings++;
            }
          });
        }
      });
    }
    
    scanDirectory(dir);
  });
  
  if (!found) {
    console.log('✅ No hardcoded secrets detected');
    checks.passed++;
  }
}

function checkDependencies() {
  console.log('\n📋 Checking package.json for known vulnerabilities...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  let hasWarnings = false;
  
  Object.entries(deps).forEach(([pkg, version]) => {
    if (version.includes('*') || version.includes('x')) {
      console.log(`⚠️  Wildcard version for ${pkg}: ${version}`);
      checks.warnings++;
      hasWarnings = true;
    }
  });
  
  if (!hasWarnings) {
    console.log('✅ No wildcard versions detected');
    checks.passed++;
  }
}

run('npm audit --audit-level=moderate', 'npm audit');
run('npm run lint', 'ESLint');
checkSecrets();
checkDependencies();

console.log('\n' + '='.repeat(50));
console.log(`📊 Security Check Results:`);
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log('='.repeat(50) + '\n');

if (checks.failed > 0) {
  console.log('❌ Security checks failed!');
  process.exit(1);
} else if (checks.warnings > 0) {
  console.log('⚠️  Security checks passed with warnings');
  process.exit(0);
} else {
  console.log('✅ All security checks passed!');
  process.exit(0);
}
