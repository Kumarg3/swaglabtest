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

const REPORT_TIMESTAMP = getReportTimestamp();
const screenshotsDir = getTimestampedScreenshotsDir();

test('Add all items to basket and checkout', async ({ page }, testInfo) => {
  const creds = getCredentials();
  
  try {
    // Login
    await page.goto('https://www.saucedemo.com/');
    await page.fill('input[name="user-name"]', creds.username);
    await page.fill('input[name="password"]', creds.password);
    await page.click('input[type="submit"]');
    
    // Wait for inventory page to load
    await page.waitForLoadState('networkidle');
    
    console.log('✓ Successfully logged in');
    
    // Get all items and add them to cart
    const addToCartButtons = page.locator('[data-test^="add-to-cart"]');
    const buttonCount = await addToCartButtons.count();
    
    console.log(`Found ${buttonCount} items, adding all to cart...`);
    
    // Add items more efficiently
    for (let i = 0; i < buttonCount; i++) {
      try {
        const button = page.locator('[data-test^="add-to-cart"]').nth(i);
        await button.click({ timeout: 5000 });
        console.log(`✓ Added item ${i + 1}/${buttonCount}`);
      } catch (e) {
        console.log(`Item ${i + 1} already added or unavailable`);
      }
    }
    
    console.log(`✓ Added all ${buttonCount} items to cart`);
    
    // Take screenshot after adding items
    const addItemsScreenshot = path.join(screenshotsDir, `${REPORT_TIMESTAMP}_AllItemsAdded.png`);
    const addItemsBuffer = await page.screenshot({ path: addItemsScreenshot });
    await testInfo.attach('AllItemsAdded_Screenshot', {
      body: addItemsBuffer,
      contentType: 'image/png',
    });
    
    // Click on basket
    await page.click('[data-test="shopping-cart-link"]');
    await page.waitForLoadState('networkidle');
    
    console.log('✓ Navigated to basket');
    
    // Take screenshot of cart
    const cartScreenshot = path.join(screenshotsDir, `${REPORT_TIMESTAMP}_Cart.png`);
    const cartBuffer = await page.screenshot({ path: cartScreenshot });
    await testInfo.attach('Cart_Screenshot', {
      body: cartBuffer,
      contentType: 'image/png',
    });
    
    // Click on checkout
    await page.click('[data-test="checkout"]');
    await page.waitForLoadState('networkidle');
    
    console.log('✓ Proceeding to checkout');
    
    // Fill checkout information with random unused names
    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Emma', 'Frank'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
    const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomZip = Math.floor(Math.random() * 90000 + 10000).toString();
    
    await page.fill('[data-test="firstName"]', randomFirst);
    await page.fill('[data-test="lastName"]', randomLast);
    await page.fill('[data-test="postalCode"]', randomZip);
    
    console.log(`✓ Filled checkout info: ${randomFirst} ${randomLast}, ZIP: ${randomZip}`);
    
    // Take screenshot of checkout form
    const checkoutFormScreenshot = path.join(screenshotsDir, `${REPORT_TIMESTAMP}_CheckoutForm.png`);
    const checkoutFormBuffer = await page.screenshot({ path: checkoutFormScreenshot });
    await testInfo.attach('CheckoutForm_Screenshot', {
      body: checkoutFormBuffer,
      contentType: 'image/png',
    });
    
    // Click continue
    await page.click('[data-test="continue"]');
    await page.waitForLoadState('networkidle');
    
    console.log('✓ Clicked continue');
    
    // Take screenshot of order summary
    const summaryScreenshot = path.join(screenshotsDir, `${REPORT_TIMESTAMP}_OrderSummary.png`);
    const summaryBuffer = await page.screenshot({ path: summaryScreenshot });
    await testInfo.attach('OrderSummary_Screenshot', {
      body: summaryBuffer,
      contentType: 'image/png',
    });
    
    // Click finish to complete order
    await page.click('[data-test="finish"]');
    await page.waitForLoadState('networkidle');
    
    console.log('✓ Order completed');
    
    // Verify order completion
    const orderConfirmation = page.locator('[data-test="complete-header"]');
    await expect(orderConfirmation).toContainText('Thank you for your order');
    
    const orderText = await page.locator('[data-test="complete-text"]').textContent();
    console.log(`✓ Order confirmation: ${orderText}`);
    
    // Take screenshot of order confirmation
    const confirmationScreenshot = path.join(screenshotsDir, `${REPORT_TIMESTAMP}_OrderConfirmation_PASS.png`);
    const confirmationBuffer = await page.screenshot({ path: confirmationScreenshot });
    await testInfo.attach('OrderConfirmation_PASS_Screenshot', {
      body: confirmationBuffer,
      contentType: 'image/png',
    });
    
  } catch (error) {
    // Take screenshot on FAIL
    try {
      const failScreenshot = path.join(screenshotsDir, `${REPORT_TIMESTAMP}_AddAllItems_FAIL.png`);
      const failBuffer = await page.screenshot({ path: failScreenshot });
      await testInfo.attach('AddAllItems_FAIL_Screenshot', {
        body: failBuffer,
        contentType: 'image/png',
      });
      console.log(`Screenshot saved: ${failScreenshot}`);
    } catch (screenshotError) {
      console.log('Could not capture fail screenshot');
    }
    throw error;
  }
}, { timeout: 120000 });
