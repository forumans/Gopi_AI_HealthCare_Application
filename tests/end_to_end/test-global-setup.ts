/**
 * Global Test Setup
 * This runs before all tests and sets up the test environment
 */

import { chromium, FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up test environment...');
  
  // Check if test database exists and set it up if needed
  try {
    console.log('📊 Setting up test database...');
    const setupScript = process.platform === 'win32' ? 'test-database-setup.ps1' : 'test-database-setup.sh';
    execSync(`powershell -ExecutionPolicy Bypass -File ${setupScript}`, { stdio: 'inherit' });
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    process.exit(1);
  }
  
  // Verify test servers are accessible
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🔍 Verifying frontend server...');
    await page.goto(process.env.FRONTEND_URL || 'http://localhost:5173');
    console.log('✅ Frontend server is accessible');
  } catch (error) {
    console.error('❌ Frontend server not accessible:', error);
    await browser.close();
    process.exit(1);
  }
  
  try {
    console.log('🔍 Verifying backend server...');
    const response = await page.goto(process.env.BACKEND_URL || 'http://localhost:8000/health');
    if (response && response.status() === 200) {
      console.log('✅ Backend server is accessible');
    } else {
      throw new Error('Backend health check failed');
    }
  } catch (error) {
    console.error('❌ Backend server not accessible:', error);
    await browser.close();
    process.exit(1);
  }
  
  await browser.close();
  console.log('✅ Test environment setup completed successfully!');
}

export default globalSetup;
