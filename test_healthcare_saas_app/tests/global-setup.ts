import { chromium, FullConfig } from '@playwright/test';
import path from 'path';

/**
 * Global setup for Healthcare E2E tests
 * 
 * This function runs before all tests and:
 * 1. Validates that required servers are running
 * 2. Creates storage states for authenticated users
 * 3. Sets up test data if needed
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up Healthcare E2E test environment...');
  
  const { baseURL } = config.webServer || { baseURL: 'http://localhost:5173' };
  const apiURL = process.env.API_URL || 'http://localhost:8000';
  
  try {
    // Step 1: Validate servers are running
    console.log('📡 Checking server connectivity...');
    
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Check frontend server
    try {
      await page.goto(baseURL, { timeout: 10000 });
      console.log('✅ Frontend server is running:', baseURL);
    } catch (error) {
      console.error('❌ Frontend server not accessible:', baseURL);
      throw new Error(`Frontend server at ${baseURL} is not running. Please start the frontend server.`);
    }
    
    // Check backend server
    try {
      const response = await page.goto(apiURL + '/health', { timeout: 5000 });
      if (response && response.status() === 200) {
        console.log('✅ Backend server is running:', apiURL);
      } else {
        console.log('⚠️ Backend server health check failed, but continuing...');
      }
    } catch (error) {
      console.log('⚠️ Backend server not accessible, but continuing tests...');
    }
    
    // Step 2: Create storage states for different user roles
    console.log('🔐 Creating authentication storage states...');
    
    const storageStatesDir = path.join(__dirname, 'storage-states');
    
    // Create storage states directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(storageStatesDir)) {
      fs.mkdirSync(storageStatesDir, { recursive: true });
    }
    
    // Create admin storage state
    await createStorageState(page, `${storageStatesDir}/admin.json`, {
      email: 'admin@clinic.com',
      password: 'Admin123!',
      role: 'admin'
    });
    
    await browser.close();
    
    console.log('✅ E2E test environment setup completed successfully!');
    console.log('📁 Storage states created in:', storageStatesDir);
    
  } catch (error) {
    console.error('❌ E2E test environment setup failed:', error);
    throw error;
  }
}

/**
 * Create storage state for a specific user role
 */
async function createStorageState(page: any, storagePath: string, credentials: {
  email: string;
  password: string;
  role: string;
}): Promise<void> {
  try {
    // Navigate to login page based on role
    const loginPath = credentials.role === 'admin' ? '/admin/login' : 
                      credentials.role === 'doctor' ? '/doctors/login' : 
                      '/patients/login';
    
    await page.goto(loginPath);
    
    // Fill login form
    await page.fill('input[type="email"]', credentials.email);
    await page.fill('input[type="password"]', credentials.password);
    await page.click('button[type="submit"]');
    
    // Wait for successful login
    await page.waitForURL('/', { timeout: 10000 });
    
    // Save storage state
    await page.context().storageState({ path: storagePath });
    
    console.log(`✅ Created storage state for ${credentials.role}: ${credentials.email}`);
    
  } catch (error) {
    console.error(`❌ Failed to create storage state for ${credentials.role}:`, error);
    throw error;
  }
}

export default globalSetup;
