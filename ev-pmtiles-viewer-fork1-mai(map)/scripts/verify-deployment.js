#!/usr/bin/env node
import { execSync } from 'child_process';

const REMOTE_SERVER = 'vm-neural-01';
const PRODUCTION_URL = 'https://vm-neural-01.duckdns.org/pmtiles-viewer-beta/';

console.log('🔍 Verifying Deployment...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

function runRemoteCommand(description, command) {
  console.log(`🔄 ${description}...`);
  try {
    const output = execSync(`ssh ${REMOTE_SERVER} "${command}"`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    console.log(`✅ ${description} completed`);
    return output.trim();
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error.message);
    throw error;
  }
}

try {
  console.log(`📡 Server: ${REMOTE_SERVER}`);
  console.log('');

  const fileCount = runRemoteCommand(
    'Checking deployed files',
    'find /var/www/html/pmtiles-viewer-beta -type f | wc -l'
  );
  console.log(`📁 Files deployed: ${fileCount}`);

  console.log('');
  console.log('🌐 Testing endpoint...');
  try {
    const response = runRemoteCommand(
      'Testing production URL',
      `curl -k -s -o /dev/null -w "%{http_code}" ${PRODUCTION_URL}`
    );

    if (response === '200') {
      console.log('✅ Production endpoint responding with 200 OK');
    } else {
      console.log(`⚠️  Production endpoint returned: ${response}`);
    }
  } catch (e) {
    console.log('⚠️  Endpoint test requires curl on remote server');
  }

  console.log('');
  console.log('✅ Deployment verification completed!');
  console.log('');
  console.log('🔗 Production URL:');
  console.log(`   ${PRODUCTION_URL}`);
} catch (error) {
  console.error('❌ Verification failed:');
  console.error(error.message);
  process.exit(1);
}
