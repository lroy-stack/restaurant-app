const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🚀 Navegando a localhost:3000/almaenigma para login');
  await page.goto('http://localhost:3000/almaenigma');

  await page.waitForTimeout(2000);

  console.log('🔐 Haciendo login...');
  await page.fill('input[type="email"]', 'admin@enigmaconalma.com');
  await page.fill('input[type="password"]', 'ArchonSecure2025!');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);

  console.log('🚀 Navegando a dashboard/reservaciones');
  await page.goto('http://localhost:3000/dashboard/reservaciones');

  await page.waitForTimeout(3000);

  console.log('📏 Midiendo altura inicial de la página');
  const initialHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log(`Altura inicial: ${initialHeight}px`);

  console.log('📜 Haciendo scroll hacia abajo...');
  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(1000);

  const afterScrollHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log(`Altura después de scroll: ${afterScrollHeight}px`);

  console.log('📜 Haciendo scroll masivo...');
  await page.evaluate(() => window.scrollBy(0, 10000));
  await page.waitForTimeout(1000);

  const finalHeight = await page.evaluate(() => document.body.scrollHeight);
  const scrollTop = await page.evaluate(() => window.pageYOffset);
  const viewportHeight = await page.evaluate(() => window.innerHeight);

  console.log(`✅ RESULTADOS DEL TEST:`);
  console.log(`- Altura final del body: ${finalHeight}px`);
  console.log(`- Posición de scroll: ${scrollTop}px`);
  console.log(`- Altura del viewport: ${viewportHeight}px`);
  console.log(`- Máximo scroll posible: ${finalHeight - viewportHeight}px`);

  if (scrollTop > (finalHeight - viewportHeight + 100)) {
    console.log('🚨 PROBLEMA CONFIRMADO: Scroll infinito detectado');
  } else {
    console.log('✅ Scroll parece normal');
  }

  await page.waitForTimeout(5000);
  await browser.close();
})();