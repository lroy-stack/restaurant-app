import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Navigate to reservas
  await page.goto('http://localhost:3001/reservas');
  await page.waitForLoadState('networkidle');
  
  try {
    // Fill date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    await page.fill('input[type="date"]', tomorrowStr);
    await page.waitForTimeout(2000);
    
    // Click first available time slot
    const timeButtons = await page.locator('button[type="button"]:visible').all();
    if (timeButtons.length > 0) {
      await timeButtons[0].click();
      await page.waitForTimeout(1000);
    }
    
    // Try to select party size using Select component
    await page.click('[role="combobox"]');
    await page.waitForTimeout(1000);
    
    // Try different selectors for party size
    const partyOptions = await page.locator('text="2 personas"').first();
    if (await partyOptions.isVisible()) {
      await partyOptions.click();
    } else {
      // Alternative: try clicking the select trigger and then option
      await page.click('text="2"');
    }
    
    await page.waitForTimeout(1000);
    
    // Click availability button
    const availabilityBtn = await page.locator('text="Verificar Disponibilidad"').first();
    if (await availabilityBtn.isVisible()) {
      await availabilityBtn.click();
      await page.waitForTimeout(4000); // Wait longer for API call
      
      // Screenshot Step 2 - THE KEY SCREENSHOT WE NEED
      await page.screenshot({ path: 'step-2-current-problem.png', fullPage: true });
      console.log('✅ CAPTURED: step-2-current-problem.png - Shows the UI issue');
      
      // Also capture desktop version
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.screenshot({ path: 'step-2-desktop-problem.png', fullPage: true });
      console.log('✅ CAPTURED: step-2-desktop-problem.png - Desktop version');
      
    } else {
      console.log('❌ Could not find availability button');
      await page.screenshot({ path: 'step-1-debug.png', fullPage: true });
    }
    
  } catch (error) {
    console.log('Error during form fill:', error.message);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  }
  
  await browser.close();
})();