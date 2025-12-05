#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';

const REMOTE_SERVER = 'vm-neural-01';
const REMOTE_PATH = '/var/www/html/pmtiles-viewer';
const TEMP_PATH = '/tmp/pmtiles-viewer-sync';

const SYNC_PATHS = ['dist/'];

console.log('🚀 Syncing Static Build to Production...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📡 Server: ${REMOTE_SERVER}`);
console.log(`📁 Remote Path: ${REMOTE_PATH}`);
console.log(`🗂️  Temp Path: ${TEMP_PATH}`);
console.log('');

function runCommand(description, command, options = {}) {
  console.log(`🔄 ${description}...`);
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
    });
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error.message);
    throw error;
  }
}

function runRemoteCommand(description, command) {
  const sshCommand = `ssh ${REMOTE_SERVER} "${command}"`;
  return runCommand(description, sshCommand, { silent: true });
}

try {
  if (!fs.existsSync('dist')) {
    console.error('❌ dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  runRemoteCommand('Creating temporary directory', `mkdir -p ${TEMP_PATH}`);

  console.log('📤 Copying build files to temporary location...');
  for (const syncPath of SYNC_PATHS) {
    if (fs.existsSync(syncPath)) {
      console.log(`  Copying ${syncPath}...`);
      const dirName = syncPath.slice(0, -1);
      runRemoteCommand(
        `Creating directory ${dirName}`,
        `mkdir -p ${TEMP_PATH}/${dirName}`
      );
      runCommand(
        `Copying ${syncPath}`,
        `scp -r ${syncPath}* ${REMOTE_SERVER}:${TEMP_PATH}/${dirName}/`,
        { silent: true }
      );
    } else {
      console.log(`  ⚠️  Skipping ${syncPath} (not found)`);
    }
  }

  console.log('🔄 Creating backup...');
  try {
    const backupName = `${REMOTE_PATH}.backup.${Date.now()}`;
    runRemoteCommand('Creating backup', `sudo cp -r ${REMOTE_PATH} ${backupName}`);
  } catch (error) {
    console.log('⚠️  Backup skipped (no permissions or directory does not exist)');
  }

  console.log('🔄 Installing files...');

  runRemoteCommand(
    'Installing dist directory',
    `sudo rm -rf ${REMOTE_PATH}/* && sudo cp -r ${TEMP_PATH}/dist/* ${REMOTE_PATH}/`
  );

  runRemoteCommand('Setting permissions', `sudo chown -R www-data:www-data ${REMOTE_PATH} && sudo chmod -R 755 ${REMOTE_PATH}`);

  runRemoteCommand('Cleaning up temporary files', `rm -rf ${TEMP_PATH}`);

  console.log('✅ Sync completed successfully!');
} catch (error) {
  console.error('❌ Sync failed:');
  console.error(error.message);
  process.exit(1);
}
