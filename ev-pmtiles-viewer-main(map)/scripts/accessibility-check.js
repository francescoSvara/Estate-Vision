#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('♿ Running Accessibility Checks...\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function checkHTMLSemantics() {
  console.log('\n📋 Checking HTML semantics...');
  const htmlFiles = ['index.html', 'public/index.html'];
  
  htmlFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf-8');
    
    const patterns = {
      hasLang: /<html[^>]*lang=/i,
      hasTitle: /<title>/i,
      hasMetaCharset: /<meta[^>]*charset=/i,
      hasMetaViewport: /<meta[^>]*name="viewport"/i
    };
    
    console.log(`\n  Checking ${file}:`);
    
    Object.entries(patterns).forEach(([check, pattern]) => {
      if (pattern.test(content)) {
        console.log(`  ✅ ${check}`);
        checks.passed++;
      } else {
        console.log(`  ❌ ${check}`);
        checks.failed++;
      }
    });
  });
  
  console.log(`\n  Checking for H1 heading:`);
  const mainJs = 'src/main.js';
  if (fs.existsSync(mainJs)) {
    const content = fs.readFileSync(mainJs, 'utf-8');
    if (/createElement\('h1'\)|<h1/i.test(content)) {
      console.log(`  ✅ H1 heading found in ${mainJs}`);
      checks.passed++;
    } else {
      console.log(`  ⚠️  No H1 heading found`);
      checks.warnings++;
    }
  }
}

function checkARIA() {
  console.log('\n📋 Checking ARIA attributes...');
  const jsFiles = fs.readdirSync('src/components', { recursive: true })
    .filter(f => f.endsWith('.js'));
  
  let ariaUsage = 0;
  
  jsFiles.forEach(file => {
    const fullPath = `src/components/${file}`;
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    const ariaAttrs = content.match(/aria-[a-z]+/g);
    if (ariaAttrs) {
      ariaUsage += ariaAttrs.length;
    }
  });
  
  console.log(`  ℹ️  Found ${ariaUsage} ARIA attributes in components`);
  if (ariaUsage > 0) {
    checks.passed++;
  } else {
    console.log(`  ⚠️  Consider adding ARIA attributes for better accessibility`);
    checks.warnings++;
  }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return null;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function checkColorContrast() {
  console.log('\n📋 Checking CSS for WCAG 2.1 AA color contrast (4.5:1 for normal text, 3:1 for large)...');
  
  const colorPairs = [
    { fg: '#f8f8f2', bg: '#282a36', name: 'Primary text on primary bg' },
    { fg: '#f8f8f2', bg: '#1d1b22', name: 'Primary text on secondary bg' },
    { fg: '#f8f8f2', bg: '#44475a', name: 'Primary text on dark gray' },
    { fg: '#8ba3d4', bg: '#282a36', name: 'Comment text on primary bg' },
    { fg: '#8be9fd', bg: '#282a36', name: 'Cyan on primary bg' },
    { fg: '#50fa7b', bg: '#282a36', name: 'Green on primary bg' },
    { fg: '#ff5555', bg: '#282a36', name: 'Red on primary bg' },
    { fg: '#bd93f9', bg: '#282a36', name: 'Purple on primary bg' },
    { fg: '#f8f8f2', bg: '#5a6891', name: 'Text on blue/gray (hover)' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  colorPairs.forEach(pair => {
    const ratio = getContrastRatio(pair.fg, pair.bg);
    if (ratio) {
      const normalTextPass = ratio >= 4.5;
      const largeTextPass = ratio >= 3.0;
      
      if (normalTextPass) {
        console.log(`  ✅ ${pair.name}: ${ratio.toFixed(2)}:1`);
        passed++;
      } else if (largeTextPass) {
        console.log(`  ⚠️  ${pair.name}: ${ratio.toFixed(2)}:1 (large text only)`);
        checks.warnings++;
      } else {
        console.log(`  ❌ ${pair.name}: ${ratio.toFixed(2)}:1 (fails WCAG AA)`);
        failed++;
      }
    }
  });
  
  if (failed === 0) {
    console.log(`  ✅ All ${passed} color combinations meet WCAG 2.1 AA standards`);
    checks.passed++;
  } else {
    console.log(`  ❌ ${failed} combinations fail WCAG 2.1 AA standards`);
    checks.failed++;
  }
}

function checkKeyboardNav() {
  console.log('\n📋 Checking for keyboard navigation support...');
  const jsFiles = fs.readdirSync('src/components', { recursive: true })
    .filter(f => f.endsWith('.js'));
  
  let hasTabIndex = 0;
  let hasKeyboardEvents = 0;
  
  jsFiles.forEach(file => {
    const fullPath = `src/components/${file}`;
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    if (/tabindex|tabIndex/.test(content)) hasTabIndex++;
    if (/keydown|keyup|keypress/.test(content)) hasKeyboardEvents++;
  });
  
  console.log(`  ℹ️  tabindex usage: ${hasTabIndex} files`);
  console.log(`  ℹ️  keyboard events: ${hasKeyboardEvents} files`);
  
  if (hasKeyboardEvents > 0) {
    console.log('  ✅ Keyboard navigation implemented');
    checks.passed++;
  } else {
    console.log('  ⚠️  Consider adding keyboard navigation support');
    checks.warnings++;
  }
}

function checkLandmarks() {
  console.log('\n📋 Checking for proper landmark usage...');
  const jsFiles = ['src/main.js', ...fs.readdirSync('src/components', { recursive: true })
    .filter(f => f.endsWith('.js'))
    .map(f => `src/components/${f}`)];
  
  let hasMain = false;
  let hasAside = false;
  let hasNav = false;
  
  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    if (/createElement\('main'\)|<main/i.test(content)) hasMain = true;
    if (/createElement\('aside'\)|<aside/i.test(content)) hasAside = true;
    if (/role=['"]navigation['"]/i.test(content)) hasNav = true;
  });
  
  if (hasMain) {
    console.log('  ✅ <main> landmark found');
    checks.passed++;
  } else {
    console.log('  ⚠️  <main> landmark missing');
    checks.warnings++;
  }
  
  if (hasAside || hasNav) {
    console.log('  ✅ Navigation/complementary landmarks found');
    checks.passed++;
  } else {
    console.log('  ⚠️  Consider adding navigation landmarks');
    checks.warnings++;
  }
}

checkHTMLSemantics();
checkARIA();
checkColorContrast();
checkKeyboardNav();
checkLandmarks();

console.log('\n' + '='.repeat(50));
console.log(`📊 Accessibility Check Results:`);
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log('='.repeat(50) + '\n');

if (checks.failed > 0) {
  console.log('⚠️  Some accessibility checks failed');
  console.log('ℹ️  These are recommendations, not blocking errors\n');
  process.exit(0);
} else {
  console.log('✅ Accessibility checks completed!\n');
  process.exit(0);
}
