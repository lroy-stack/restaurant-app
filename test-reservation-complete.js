import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,  // Ver el proceso
    slowMo: 1000     // 1 segundo entre acciones
  });
  const page = await browser.newPage();
  
  console.log('🧪 TESTING: Flujo completo de reserva...');
  
  try {
    // 1. Navegar a reservas
    await page.goto('http://localhost:3001/reservas');
    await page.waitForLoadState('networkidle');
    console.log('✅ Página de reservas cargada');
    
    // 2. Llenar STEP 1 - Fecha, Hora, Personas
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    await page.fill('input[type="date"]', tomorrowStr);
    console.log('✅ Fecha seleccionada:', tomorrowStr);
    
    // Esperar a que se carguen los time slots
    await page.waitForTimeout(3000);
    
    // Seleccionar hora 19:00
    await page.click('button:has-text("19:00")');
    console.log('✅ Hora seleccionada: 19:00');
    
    // Seleccionar 2 personas
    await page.click('[role="combobox"]');
    await page.waitForTimeout(1000);
    await page.click('text="2 personas"');
    console.log('✅ Party size: 2 personas');
    
    // Click en "Verificar Disponibilidad"
    await page.click('button:has-text("Verificar Disponibilidad")');
    await page.waitForTimeout(4000); // Esperar API call
    console.log('✅ Disponibilidad verificada');
    
    // Screenshot Step 2
    await page.screenshot({ path: 'test-step2-after-fixes.png', fullPage: true });
    console.log('📸 Screenshot Step 2 capturado');
    
    // 3. STEP 2 - Seleccionar mesa (primera disponible)
    const firstTable = await page.locator('[data-testid="table-card"], .cursor-pointer').first();
    await firstTable.click();
    console.log('✅ Mesa seleccionada');
    
    await page.click('button:has-text("Siguiente")');
    await page.waitForTimeout(2000);
    console.log('✅ Paso 2 completado');
    
    // 4. STEP 3 - Datos personales
    await page.fill('input[name="stepThree.firstName"]', 'Juan');
    await page.fill('input[name="stepThree.lastName"]', 'Pérez');
    await page.fill('input[name="stepThree.email"]', 'juan@test.com');
    await page.fill('input[name="stepThree.phone"]', '612345678');
    console.log('✅ Datos personales completados');
    
    await page.click('button:has-text("Siguiente")');
    await page.waitForTimeout(2000);
    
    // 5. STEP 4 - Consentimientos GDPR
    await page.check('input[name="stepFour.dataProcessingConsent"]');
    await page.check('input[name="stepFour.emailConsent"]');
    console.log('✅ Consentimientos GDPR aceptados');
    
    // 6. Finalizar reserva
    console.log('🚀 Enviando reserva...');
    await page.click('button[type="submit"]:has-text("Confirmar Reserva")');
    await page.waitForTimeout(5000); // Esperar respuesta
    
    // 7. Verificar éxito
    const successElement = await page.locator('text="¡Reserva confirmada!"').first();
    if (await successElement.isVisible()) {
      console.log('🎉 ¡ÉXITO! Reserva completada correctamente');
      await page.screenshot({ path: 'test-success-page.png', fullPage: true });
    } else {
      console.log('❌ No se encontró página de éxito');
      await page.screenshot({ path: 'test-error-state.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('❌ Error durante el test:', error);
    await page.screenshot({ path: 'test-failed.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🔚 Test terminado');
  }
})();