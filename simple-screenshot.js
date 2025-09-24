import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport for mobile simulation
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Navigate to reservas
  await page.goto('http://localhost:3001/reservas');
  await page.waitForLoadState('networkidle');
  
  // Screenshot inicial móvil
  await page.screenshot({ path: 'mobile-homepage.png', fullPage: true });
  
  // Desktop viewport
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.screenshot({ path: 'desktop-homepage.png', fullPage: true });
  
  console.log('Screenshots capturados - ahora necesito navegar manualmente al step 2');
  
  await browser.close();
})();