import { chromium } from 'playwright';

async function testQRToggleFinal() {
  console.log('🎯 FINAL QR TOGGLE TEST - PROFESSIONAL END-TO-END VALIDATION');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  let successfulAPICalls = 0;
  let errorAPICalls = 0;

  // Monitor all API calls to qr-settings
  page.on('response', response => {
    if (response.url().includes('/api/admin/qr-settings')) {
      if (response.status() === 200) {
        console.log(`✅ SUCCESS: ${response.status()} ${response.url()}`);
        successfulAPICalls++;
      } else {
        console.log(`❌ ERROR: ${response.status()} ${response.url()}`);
        errorAPICalls++;
      }
    }
  });

  try {
    console.log('🔐 Step 1: Login to admin panel...');
    await page.goto('http://localhost:3000/almaenigma');
    await page.fill('input[type="email"]', 'admin@enigmaconalma.com');
    await page.fill('input[type="password"]', 'ArchonSecure2025!');
    await page.click('button:has-text("Acceder al Panel")');
    await page.waitForTimeout(3000);

    console.log('🔗 Step 2: Navigate to QR settings page...');
    await page.goto('http://localhost:3000/dashboard/mesas?tab=qrcodes');
    await page.waitForTimeout(5000);

    console.log('🔘 Step 3: Test QR toggle functionality...');

    // Look for toggle switches in QR System card
    const qrCard = page.locator('text="Sistema QR"').first();
    await qrCard.waitFor({ timeout: 10000 });

    // Find toggle switches within the QR System card
    const toggles = page.locator('[role="switch"]');
    const toggleCount = await toggles.count();

    console.log(`📊 Found ${toggleCount} toggle switches`);

    if (toggleCount > 0) {
      // Test first toggle (QR Ordering)
      console.log('🔄 Testing QR Ordering toggle...');
      await toggles.first().click();
      await page.waitForTimeout(2000);

      if (toggleCount > 1) {
        // Test second toggle (Menu Only Mode)
        console.log('🔄 Testing Menu Only mode toggle...');
        await toggles.nth(1).click();
        await page.waitForTimeout(2000);
      }
    }

    // Wait for any final API calls to complete
    await page.waitForTimeout(3000);

    console.log('\n📊 FINAL TEST RESULTS:');
    console.log(`✅ Successful API calls: ${successfulAPICalls}`);
    console.log(`❌ Failed API calls: ${errorAPICalls}`);

    if (errorAPICalls === 0 && successfulAPICalls > 0) {
      console.log('🎉 SUCCESS: QR toggle functionality is working correctly!');
    } else {
      console.log('⚠️  WARNING: Some API calls failed - check logs above');
    }

  } catch (error) {
    console.error('💥 CRITICAL ERROR during test:', error);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();

    console.log('\n🏁 Professional end-to-end test completed.');
  }
}

testQRToggleFinal();