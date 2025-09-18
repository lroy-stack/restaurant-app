const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Login first
  console.log('🔐 Haciendo login...');
  await page.goto('http://localhost:3000/almaenigma');
  await page.waitForTimeout(2000);
  await page.fill('input[type="email"]', 'admin@enigmaconalma.com');
  await page.fill('input[type="password"]', 'ArchonSecure2025!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('\n=== TESTING MESAS PAGE (SIN PROBLEMA) ===');
  await page.goto('http://localhost:3000/dashboard/mesas');
  await page.waitForTimeout(3000);

  const mesasBodyHeight = await page.evaluate(() => document.body.scrollHeight);
  const mesasViewportHeight = await page.evaluate(() => window.innerHeight);

  await page.evaluate(() => window.scrollBy(0, 10000));
  await page.waitForTimeout(1000);

  const mesasScrollPos = await page.evaluate(() => window.pageYOffset);
  const mesasMaxScroll = mesasBodyHeight - mesasViewportHeight;

  console.log(`📊 MESAS - Body Height: ${mesasBodyHeight}px`);
  console.log(`📊 MESAS - Viewport Height: ${mesasViewportHeight}px`);
  console.log(`📊 MESAS - Scroll Position: ${mesasScrollPos}px`);
  console.log(`📊 MESAS - Max Scroll: ${mesasMaxScroll}px`);

  if (mesasScrollPos > mesasMaxScroll + 50) {
    console.log('🚨 MESAS - PROBLEMA DETECTADO: Scroll infinito');
  } else {
    console.log('✅ MESAS - Normal scroll behavior');
  }

  console.log('\n=== TESTING RESERVACIONES PAGE (CON PROBLEMA) ===');
  await page.goto('http://localhost:3000/dashboard/reservaciones');
  await page.waitForTimeout(3000);

  const reservBodyHeight = await page.evaluate(() => document.body.scrollHeight);
  const reservViewportHeight = await page.evaluate(() => window.innerHeight);

  await page.evaluate(() => window.scrollBy(0, 10000));
  await page.waitForTimeout(1000);

  const reservScrollPos = await page.evaluate(() => window.pageYOffset);
  const reservMaxScroll = reservBodyHeight - reservViewportHeight;

  console.log(`📊 RESERVACIONES - Body Height: ${reservBodyHeight}px`);
  console.log(`📊 RESERVACIONES - Viewport Height: ${reservViewportHeight}px`);
  console.log(`📊 RESERVACIONES - Scroll Position: ${reservScrollPos}px`);
  console.log(`📊 RESERVACIONES - Max Scroll: ${reservMaxScroll}px`);

  if (reservScrollPos > reservMaxScroll + 50) {
    console.log('🚨 RESERVACIONES - PROBLEMA CONFIRMADO: Scroll infinito');
  } else {
    console.log('✅ RESERVACIONES - Normal scroll behavior');
  }

  console.log('\n=== COMPARACIÓN ===');
  console.log(`Diferencia Body Height: ${Math.abs(reservBodyHeight - mesasBodyHeight)}px`);
  console.log(`Diferencia Scroll Behavior: ${Math.abs(reservScrollPos - mesasScrollPos)}px`);

  await page.waitForTimeout(5000);
  await browser.close();
})();