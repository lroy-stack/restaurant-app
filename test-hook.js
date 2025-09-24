// Test directo del hook useReservations
const testHookDirectly = async () => {
  // Simular datos que useReservations debería recibir del form
  const reservationData = {
    dateTime: "2025-09-24T20:30:00.000Z",
    tableIds: ["campanari_t4"], // ✅ CORRECTO - mesa disponible
    partySize: 2,
    firstName: "Leroy",
    lastName: "Li",
    email: "larion2594@gmail.com",
    phone: "+34654225342",
    occasion: "Test hook useReservations",
    dietaryNotes: "Sin gluten",
    specialRequests: "Test directo hook",
    preOrderItems: [],
    preOrderTotal: 0,
    hasPreOrder: false,
    dataProcessingConsent: true,
    emailConsent: true,
    marketingConsent: false,
    preferredLanguage: "ES"
  }

  // Simular transformación de useReservations línea 137-148
  const [date, time] = reservationData.dateTime.split('T')
  const timeOnly = time?.slice(0, 5) || '19:00'

  const apiData = {
    firstName: reservationData.firstName,
    lastName: reservationData.lastName,
    email: reservationData.email,
    phone: reservationData.phone,
    date: date,
    time: timeOnly,
    partySize: reservationData.partySize,
    tableIds: reservationData.tableIds ? reservationData.tableIds : (reservationData.tableId ? [reservationData.tableId] : []),
    specialRequests: reservationData.specialRequests || null,
    preOrderItems: reservationData.preOrderItems || [],
    preOrderTotal: reservationData.preOrderTotal || 0,
    occasion: reservationData.occasion || null,
    dietaryNotes: reservationData.dietaryNotes || null,
    dataProcessingConsent: reservationData.dataProcessingConsent,
    emailConsent: reservationData.emailConsent,
    marketingConsent: reservationData.marketingConsent,
    preferredLanguage: reservationData.preferredLanguage || 'ES'
  }

  console.log('🚀 HOOK TEST - Payload que debería enviar:', JSON.stringify(apiData, null, 2))

  const response = await fetch('http://localhost:3000/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiData),
  })

  const result = await response.json()
  console.log('🎯 HOOK TEST RESULT:', result)
  return result
}

testHookDirectly()