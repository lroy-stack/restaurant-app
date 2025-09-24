import { chromium } from 'playwright';

async function testQRSettings() {
  console.log('🧪 Starting E2E QR Settings Test...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Navigate to admin login
    console.log('📍 Step 1: Navigating to admin login...');
    await page.goto('http://localhost:3000/dashboard/mesas?tab=qrcodes');
    await page.waitForTimeout(2000);

    // Check if we're at login page
    const isLoginPage = await page.locator('text=Panel de Administración').isVisible();
    console.log(`🔍 Is login page visible: ${isLoginPage}`);

    if (isLoginPage) {
      console.log('🔐 Step 2: Logging in as admin...');

      // Fill login form
      await page.fill('input[type="email"]', 'admin@enigmaconalma.com');
      await page.fill('input[type="password"]', 'ArchonSecure2025!');
      await page.click('button:has-text("Acceder al Panel")');

      // Wait for redirect
      await page.waitForTimeout(3000);
    }

    // Step 3: Navigate to QR settings if not already there
    console.log('📍 Step 3: Navigating to QR settings tab...');
    await page.goto('http://localhost:3000/dashboard/mesas?tab=qrcodes');
    await page.waitForTimeout(2000);

    // Step 4: Check QR System component
    console.log('🔍 Step 4: Checking QR System component...');
    const qrSystemCard = await page.locator('text=Sistema QR').isVisible();
    console.log(`QR System card visible: ${qrSystemCard}`);

    // Step 5: Intercept API calls
    console.log('📡 Step 5: Monitoring API calls...');

    page.on('response', response => {
      if (response.url().includes('/api/admin/qr-settings')) {
        console.log(`📡 API Response: ${response.status()} ${response.url()}`);
        if (response.status() >= 400) {
          console.log(`❌ API Error: ${response.status()}`);
        }
      }
    });

    // Step 6: Try to interact with QR toggle
    console.log('🔧 Step 6: Testing QR toggle interaction...');

    // Wait for the component to load
    await page.waitForSelector('[data-testid="qr-ordering-toggle"], .switch, [role="switch"]', { timeout: 10000 });

    // Try to find and click the toggle
    const toggles = await page.locator('[role="switch"], .switch').all();
    console.log(`Found ${toggles.length} toggle switches`);

    if (toggles.length > 0) {
      console.log('🔄 Attempting to toggle first switch...');
      await toggles[0].click();
      await page.waitForTimeout(3000);
    }

    // Step 7: Check browser console for errors
    console.log('🔍 Step 7: Checking browser console for errors...');

    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(`❌ Console Error: ${msg.text()}`);
      }
    });

    // Wait a bit more to catch any async errors
    await page.waitForTimeout(5000);

    logs.forEach(log => console.log(log));

    // Step 8: Final screenshot
    console.log('📸 Step 8: Taking final screenshot...');
    await page.screenshot({ path: '/tmp/qr-test-final.png', fullPage: true });

    console.log('✅ E2E Test completed');

  } catch (error) {
    console.error('❌ E2E Test failed:', error);
    await page.screenshot({ path: '/tmp/qr-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testQRSettings();