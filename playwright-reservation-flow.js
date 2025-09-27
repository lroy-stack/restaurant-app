import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navegar a reservas
  await page.goto('http://localhost:3001/reservas');
  await page.waitForLoadState('networkidle');
  
  // Screenshot inicial
  await page.screenshot({ path: 'step-0-homepage.png', fullPage: true });
  
  // Llenar Step 1
  // Fecha (mañana)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  await page.fill('input[type="date"]', tomorrowStr);
  
  // Esperar a que se carguen los time slots
  await page.waitForTimeout(2000);
  
  // Seleccionar primera hora disponible
  const timeButton = await page.locator('button[type="button"]').first();
  await timeButton.click();
  
  // Seleccionar número de personas
  await page.click('[role="combobox"]');
  await page.click('[data-value="2"]');
  
  // Screenshot Step 1 completo
  await page.screenshot({ path: 'step-1-completed.png', fullPage: true });
  
  // Click en "Verificar Disponibilidad" 
  await page.click('button:has-text("Verificar Disponibilidad")');
  
  // Esperar a que aparezca Step 2
  await page.waitForTimeout(3000);
  
  // Screenshot Step 2 actual - AQUÍ ES DONDE VEMOS EL PROBLEMA
  await page.screenshot({ path: 'step-2-current-ui.png', fullPage: true });
  
  console.log('Screenshots capturados:');
  console.log('- step-0-homepage.png: Página inicial');
  console.log('- step-1-completed.png: Step 1 completado');
  console.log('- step-2-current-ui.png: Step 2 con problema de UI');
  
  await browser.close();
})();