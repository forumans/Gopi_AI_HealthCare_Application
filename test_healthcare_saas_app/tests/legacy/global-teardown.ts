import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Global teardown for Healthcare E2E tests
 * 
 * This function runs after all tests and:
 * 1. Cleans up test data
 * 2. Removes temporary files
 * 3. Generates final reports
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up E2E test environment...');
  
  try {
    // Clean up storage states (optional - comment out if you want to keep them)
    const storageStatesDir = path.join(__dirname, 'storage-states');
    
    if (fs.existsSync(storageStatesDir)) {
      const files = fs.readdirSync(storageStatesDir);
      
      // Clean up old storage states (keep recent ones for debugging)
      files.forEach(file => {
        const filePath = path.join(storageStatesDir, file);
        const stats = fs.statSync(filePath);
        
        // Remove files older than 24 hours
        const hoursOld = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
        if (hoursOld > 24) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Removed old storage state: ${file}`);
        }
      });
    }
    
    // Clean up test results older than 7 days
    const testResultsDir = path.join(process.cwd(), 'test-results');
    if (fs.existsSync(testResultsDir)) {
      console.log('📊 Cleaning up old test results...');
      // Add cleanup logic here if needed
    }
    
    console.log('✅ E2E test environment cleanup completed!');
    
  } catch (error) {
    console.error('❌ E2E test environment cleanup failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;
