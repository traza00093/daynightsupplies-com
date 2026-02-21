#!/usr/bin/env node

const { ensureAdminUser } = require('./ensure-admin.js');

async function initializeAdmin() {
  try {
    console.log('Initializing admin user...');
    await ensureAdminUser();
    console.log('Admin initialization complete');
  } catch (error) {
    console.error('Error during admin initialization:', error.message);
    process.exit(1);
  }
}

initializeAdmin();
