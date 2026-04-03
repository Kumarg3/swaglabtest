import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { getCredentials } from '../config/credentials';

// Utility function to generate timestamp in DDMMYY_HHMMSS format
function getTimestamp(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const hh = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${dd}${mm}${yy}_${hh}${mins}${ss}`;
}

// Get or create report timestamp (used as prefix for all screenshots in this test run)
function getReportTimestamp(): string {
  const timestampFile = path.join(__dirname, '../.test-timestamp');
  
  // If timestamp file exists and is recent (within 5 seconds), use it
  if (fs.existsSync(timestampFile)) {
    try {
      const data = fs.readFileSync(timestampFile, 'utf-8');
      const fileTime = parseInt(data);
      const now = Date.now();
      if (now - fileTime < 5000) { // 5 second window
        return fs.readFileSync(timestampFile.replace('.test-timestamp', '.report-timestamp'), 'utf-8');
      }
    } catch (e) {
      // Fall through to create new timestamp
    }
  }
  
  // Create new timestamp
  const reportTime = getTimestamp();
  fs.writeFileSync(timestampFile, Date.now().toString());
  fs.writeFileSync(timestampFile.replace('.test-timestamp', '.report-timestamp'), reportTime);
  return reportTime;
}

// Get timestamped screenshots directory
function getTimestampedScreenshotsDir(): string {
  const reportTime = getReportTimestamp();
  const screenshotsDir = path.join(__dirname, '../Screenshots', reportTime);
  
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  return screenshotsDir;
}

// Get report-wide timestamp for all screenshots in this test run
const REPORT_TIMESTAMP = getReportTimestamp();

// Create Screenshots folder if it doesn't exist
const screenshotsDir = getTimestampedScreenshotsDir();

test('Login to Swag Labs and verify page title', async ({ page }, testInfo) => {
  const creds = getCredentials();
  
  try {
    // Step 1: Navigate to the link
    await page.goto('https://www.saucedemo.com/');
    
    // Step 2: Enter username (encrypted)
    await page.fill('input[name="user-name"]', creds.username);
    
    // Step 3: Enter password (encrypted)
    await page.fill('input[name="password"]', creds.password);
    
    // Step 4: Click on Login
    await page.click('input[type="submit"]');
    
    // Step 5: Verify the page name is Swag Labs
    await expect(page).toHaveTitle('Swag Labs');
    
    // Additional verification - check for page heading
    const heading = page.locator('.app_logo');
    await expect(heading).toContainText('Swag Labs');
    
    console.log('✓ Successfully logged in and verified page title');
    
    // Take screenshot on PASS using report generation time as prefix
    const passScreenshot = path.join(screenshotsDir, `${REPORT_TIMESTAMP}_Login_PASS.png`);
    const screenshotBuffer = await page.screenshot({ path: passScreenshot });
    
    // Attach screenshot to HTML report
    await testInfo.attach('Login_PASS_Screenshot', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });
    
    console.log(`Screenshot saved: ${passScreenshot}`);
  } catch (error) {
    // Take screenshot on FAIL using report generation time as prefix
    const failScreenshot = path.join(screenshotsDir, `${REPORT_TIMESTAMP}_Login_FAIL.png`);
    const screenshotBuffer = await page.screenshot({ path: failScreenshot });
    
    // Attach screenshot to HTML report
    await testInfo.attach('Login_FAIL_Screenshot', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });
    
    console.log(`Screenshot saved: ${failScreenshot}`);
    throw error;
  }
});

test('Add bike light to cart and proceed to checkout', async ({ page }, testInfo) => {
  const creds = getCredentials();
  
  try {
    // Login first (using encrypted credentials)
    await page.goto('https://www.saucedemo.com/');
    await page.fill('input[name="user-name"]', creds.username);
    await page.fill('input[name="password"]', creds.password);
    await page.click('input[type="submit"]');
    
    // Wait for inventory page to load
    await page.waitForLoadState('networkidle');
    
    // Step 1: Add an item 'bike light' - Find all buttons and click the one for bike light
    const bikeLight = page.locator('[data-test="inventory-item"]').filter({ hasText: 'Sauce Labs Bike Light' });
    await bikeLight.locator('button').click();
    console.log('✓ Bike Light added to cart');
    
    // Step 2: Click on basket
    await page.click('[data-test="shopping-cart-link"]');
    await page.waitForLoadState('networkidle');
    
    // Step 3: Click on checkout
    await page.click('[data-test="checkout"]');
    await page.waitForLoadState('networkidle');
    
    // Step 4: Enter any first name
    await page.fill('[data-test="firstName"]', 'John');
    
    // Step 5: Enter any last name
    await page.fill('[data-test="lastName"]', 'Doe');
    
    // Step 6: Enter any zip code
    await page.fill('[data-test="postalCode"]', '12345');
    
    // Step 7: Click on Continue
    await page.click('[data-test="continue"]');
    await page.waitForLoadState('networkidle');
    
    // Click finish to complete order
    await page.click('[data-test="finish"]');
    await page.waitForLoadState('networkidle');
    
    // Capture order confirmation
    const orderNumber = page.locator('[data-test="complete-header"]');
    await expect(orderNumber).toContainText('Thank you for your order');
    
    const orderId = page.locator('[data-test="complete-text"]');
    const orderText = await orderId.textContent();
    console.log('✓ Order completed - ' + orderText);
    
    // Take screenshot on PASS using report generation time as prefix
    const passScreenshot = path.join(screenshotsDir, `${REPORT_TIMESTAMP}_Checkout_PASS.png`);
    const screenshotBuffer = await page.screenshot({ path: passScreenshot });
    
    // Attach screenshot to HTML report
    await testInfo.attach('Checkout_PASS_Screenshot', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });
    
    console.log(`Screenshot saved: ${passScreenshot}`);
  } catch (error) {
    // Take screenshot on FAIL using report generation time as prefix
    const failScreenshot = path.join(screenshotsDir, `${REPORT_TIMESTAMP}_Checkout_FAIL.png`);
    const screenshotBuffer = await page.screenshot({ path: failScreenshot });
    
    // Attach screenshot to HTML report
    await testInfo.attach('Checkout_FAIL_Screenshot', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });
    
    console.log(`Screenshot saved: ${failScreenshot}`);
    throw error;
  }
});
