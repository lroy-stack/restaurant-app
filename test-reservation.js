// Test script para useReservations hook
const testReservation = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: "TEST",
        lastName: "HOOK",
        email: "test.hook@gmail.com",
        phone: "+34654225342",
        date: "2025-09-24",
        time: "20:30",
        partySize: 2,
        tableIds: ["principal_s5"], // ✅ ARRAY CORRECTO
        occasion: "Test hook directo",
        dietaryNotes: "Sin gluten",
        specialRequests: "Test useReservations hook",
        preOrderItems: [],
        preOrderTotal: 0,
        dataProcessingConsent: true,
        emailConsent: true,
        marketingConsent: false,
        preferredLanguage: "ES"
      })
    })

    const result = await response.json()
    console.log('TEST HOOK RESULT:', result)
    return result
  } catch (error) {
    console.error('TEST HOOK ERROR:', error)
  }
}

testReservation()