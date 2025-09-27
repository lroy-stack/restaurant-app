import { chromium } from 'playwright';

async function debugHeaders() {
  console.log('🔍 Debug Headers Test...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture ALL network requests
  page.on('request', request => {
    if (request.url().includes('/api/admin/qr-settings')) {
      console.log('\n📤 REQUEST DETAILS:');
      console.log('URL:', request.url());
      console.log('Method:', request.method());
      console.log('Headers:', request.headers());
      if (request.method() === 'POST') {
        console.log('Body:', request.postData());
      }
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/admin/qr-settings')) {
      console.log('\n📥 RESPONSE DETAILS:');
      console.log('Status:', response.status());
      console.log('Headers:', response.headers());
    }
  });

  try {
    // Login
    await page.goto('http://localhost:3000/dashboard/mesas?tab=qrcodes');
    await page.waitForTimeout(2000);

    const isLoginPage = await page.locator('text=Panel de Administración').isVisible();
    if (isLoginPage) {
      console.log('🔐 Logging in...');
      await page.fill('input[type="email"]', 'admin@enigmaconalma.com');
      await page.fill('input[type="password"]', 'ArchonSecure2025!');
      await page.click('button:has-text("Acceder al Panel")');
      await page.waitForTimeout(3000);
    }

    // Navigate to QR settings
    await page.goto('http://localhost:3000/dashboard/mesas?tab=qrcodes');
    await page.waitForTimeout(5000);

    console.log('\n🏁 Headers debug completed');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugHeaders();