import { createReservationSchema, errorMessages, type Language } from '../reservation-multilingual'

describe('Reservation Multilingual Validations', () => {
  describe('createReservationSchema', () => {
    describe('Español (es)', () => {
      const schema = createReservationSchema('es')
      
      it('debe validar datos válidos correctamente', () => {
        const validData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
          phone: '+34612345678',
          preferredLanguage: 'es' as const,
          partySize: 2,
          date: '2025-09-15',
          time: '20:00',
          tableId: 'table_001',
          tableZone: 'TERRACE' as const,
          hasPreOrder: false,
          preOrderItems: [],
          preOrderTotal: 0,
          isVipCustomer: false,
          privacyPolicyAccepted: true,
          termsAccepted: true,
          marketingConsent: false,
          emailNotifications: true,
          urgentRequest: false,
        }
        
        const result = schema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('debe rechazar firstName vacío con mensaje en español', () => {
        const invalidData = {
          firstName: '',
          lastName: 'Pérez',
          email: 'juan@example.com',
          phone: '+34612345678',
          preferredLanguage: 'es' as const,
          partySize: 2,
          date: '2025-09-15',
          time: '20:00',
          tableId: 'table_001',
          tableZone: 'TERRACE' as const,
          privacyPolicyAccepted: true,
          termsAccepted: true,
        }
        
        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El nombre es requerido')
        }
      })

      it('debe rechazar firstName muy corto con mensaje en español', () => {
        const invalidData = {
          firstName: 'J',
          lastName: 'Pérez',
          email: 'juan@example.com',
          phone: '+34612345678',
          preferredLanguage: 'es' as const,
          partySize: 2,
          date: '2025-09-15',
          time: '20:00',
          tableId: 'table_001',
          tableZone: 'TERRACE' as const,
          privacyPolicyAccepted: true,
          termsAccepted: true,
        }
        
        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El nombre debe tener al menos 2 caracteres')
        }
      })

      it('debe rechazar email inválido con mensaje en español', () => {
        const invalidData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'email-invalido',
          phone: '+34612345678',
          preferredLanguage: 'es' as const,
          partySize: 2,
          date: '2025-09-15',
          time: '20:00',
          tableId: 'table_001',
          tableZone: 'TERRACE' as const,
          privacyPolicyAccepted: true,
          termsAccepted: true,
        }
        
        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          const emailError = result.error.issues.find(issue => issue.path.includes('email'))
          expect(emailError?.message).toBe('Email válido requerido')
        }
      })

      it('debe rechazar teléfono inválido con mensaje en español', () => {
        const invalidData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
          phone: '123',
          preferredLanguage: 'es' as const,
          partySize: 2,
          date: '2025-09-15',
          time: '20:00',
          tableId: 'table_001',
          tableZone: 'TERRACE' as const,
          privacyPolicyAccepted: true,
          termsAccepted: true,
        }
        
        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          const phoneError = result.error.issues.find(issue => issue.path.includes('phone'))
          expect(phoneError?.message).toBe('Teléfono válido requerido')
        }
      })

      it('debe validar números de teléfono válidos', () => {
        const validPhones = [
          '+34612345678',
          '+1 (555) 123-4567',
          '612345678',
          '+34 612 345 678',
          '(555) 123-4567'
        ]
        
        validPhones.forEach(phone => {
          const testData = {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan@example.com',
            phone,
            preferredLanguage: 'es' as const,
            partySize: 2,
            date: '2025-09-15',
            time: '20:00',
            tableId: 'table_001',
            tableZone: 'TERRACE' as const,
            privacyPolicyAccepted: true,
            termsAccepted: true,
          }
          
          const result = schema.safeParse(testData)
          expect(result.success).toBe(true)
        })
      })

      it('debe validar partySize dentro de rango', () => {
        // Mínimo válido
        const minData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
          phone: '+34612345678',
          partySize: 1,
          date: '2025-09-15',
          time: '20:00',
          tableId: 'table_001',
          tableZone: 'TERRACE' as const,
          privacyPolicyAccepted: true,
          termsAccepted: true,
        }
        
        expect(schema.safeParse(minData).success).toBe(true)
        
        // Máximo válido
        const maxData = { ...minData, partySize: 12 }
        expect(schema.safeParse(maxData).success).toBe(true)
        
        // Inválido - menos del mínimo
        const belowMinData = { ...minData, partySize: 0 }
        const result = schema.safeParse(belowMinData)
        expect(result.success).toBe(false)
        if (!result.success) {
          const partySizeError = result.error.issues.find(issue => issue.path.includes('partySize'))
          expect(partySizeError?.message).toBe('Mínimo 1 persona')
        }
        
        // Inválido - más del máximo
        const aboveMaxData = { ...minData, partySize: 13 }
        const resultMax = schema.safeParse(aboveMaxData)
        expect(resultMax.success).toBe(false)
        if (!resultMax.success) {
          const partySizeError = resultMax.error.issues.find(issue => issue.path.includes('partySize'))
          expect(partySizeError?.message).toBe('Máximo 12 personas')
        }
      })

      it('debe rechazar privacyPolicyAccepted falso', () => {
        const invalidData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
          phone: '+34612345678',
          partySize: 2,
          date: '2025-09-15',
          time: '20:00',
          tableId: 'table_001',
          tableZone: 'TERRACE' as const,
          privacyPolicyAccepted: false,
          termsAccepted: true,
        }
        
        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          const privacyError = result.error.issues.find(issue => issue.path.includes('privacyPolicyAccepted'))
          expect(privacyError?.message).toBe('Debe aceptar la política de privacidad')
        }
      })

      it('debe rechazar termsAccepted falso', () => {
        const invalidData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
          phone: '+34612345678',
          partySize: 2,
          date: '2025-09-15',
          time: '20:00',
          tableId: 'table_001',
          tableZone: 'TERRACE' as const,
          privacyPolicyAccepted: true,
          termsAccepted: false,
        }
        
        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          const termsError = result.error.issues.find(issue => issue.path.includes('termsAccepted'))
          expect(termsError?.message).toBe('Debe aceptar los términos y condiciones')
        }
      })
    })

    describe('English (en)', () => {
      const schema = createReservationSchema('en')
      
      it('debe rechazar firstName vacío con mensaje en inglés', () => {
        const invalidData = {
          firstName: '',
          lastName: 'Smith',
          email: 'john@example.com',
          phone: '+1234567890',
          preferredLanguage: 'en' as const,
          partySize: 2,
          date: '2025-09-15',
          time: '20:00',
          tableId: 'table_001',
          tableZone: 'TERRACE' as const,
          privacyPolicyAccepted: true,
          termsAccepted: true,
        }
        
        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Name is required')
        }
      })

      it('debe rechazar email inválido con mensaje en inglés', () => {
        const invalidData = {
          firstName: 'John',
          lastName: 'Smith',
          email: 'invalid-email',
          phone: '+1234567890',
          preferredLanguage: 'en' as const,
          partySize: 2,
          date: '2025-09-15',
          time: '20:00',
          tableId: 'table_001',
          tableZone: 'TERRACE' as const,
          privacyPolicyAccepted: true,
          termsAccepted: true,
        }
        
        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          const emailError = result.error.issues.find(issue => issue.path.includes('email'))
          expect(emailError?.message).toBe('Valid email required')
        }
      })

      it('debe rechazar privacyPolicyAccepted falso con mensaje en inglés', () => {
        const invalidData = {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@example.com',
          phone: '+1234567890',
          partySize: 2,
          date: '2025-09-15',
          time: '20:00',
          tableId: 'table_001',
          tableZone: 'TERRACE' as const,
          privacyPolicyAccepted: false,
          termsAccepted: true,
        }
        
        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          const privacyError = result.error.issues.find(issue => issue.path.includes('privacyPolicyAccepted'))
          expect(privacyError?.message).toBe('Must accept privacy policy')
        }
      })
    })
  })

  describe('Pre-order Integration', () => {
    const schema = createReservationSchema('es')

    it('debe validar preOrderItems correctamente', () => {
      const dataWithPreOrder = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '+34612345678',
        partySize: 2,
        date: '2025-09-15',
        time: '20:00',
        tableId: 'table_001',
        tableZone: 'TERRACE' as const,
        hasPreOrder: true,
        preOrderItems: [
          {
            itemId: 'item_001',
            name: 'Tartar de Atún',
            quantity: 1,
            price: 22.5,
            type: 'dish' as const,
            category: 'Entrantes',
            notes: 'Sin cebolla'
          }
        ],
        preOrderTotal: 22.5,
        privacyPolicyAccepted: true,
        termsAccepted: true,
      }
      
      const result = schema.safeParse(dataWithPreOrder)
      expect(result.success).toBe(true)
    })

    it('debe rechazar preOrderItems con cantidad inválida', () => {
      const invalidPreOrderData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '+34612345678',
        partySize: 2,
        date: '2025-09-15',
        time: '20:00',
        tableId: 'table_001',
        tableZone: 'TERRACE' as const,
        hasPreOrder: true,
        preOrderItems: [
          {
            itemId: 'item_001',
            name: 'Tartar de Atún',
            quantity: 0, // Cantidad inválida
            price: 22.5,
            type: 'dish' as const
          }
        ],
        privacyPolicyTotal: 22.5,
        privacyPolicyAccepted: true,
        termsAccepted: true,
      }
      
      const result = schema.safeParse(invalidPreOrderData)
      expect(result.success).toBe(false)
    })
  })

  describe('Zone Validation', () => {
    const schema = createReservationSchema('es')

    it('debe validar zonas válidas', () => {
      const validZones = [
        'TERRACE',
        'TERRACE_STANDARD',
        'INTERIOR_WINDOW',
        'INTERIOR_STANDARD',
        'BAR_AREA'
      ]
      
      validZones.forEach(zone => {
        const testData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
          phone: '+34612345678',
          partySize: 2,
          date: '2025-09-15',
          time: '20:00',
          tableId: 'table_001',
          tableZone: zone as any,
          privacyPolicyAccepted: true,
          termsAccepted: true,
        }
        
        const result = schema.safeParse(testData)
        expect(result.success).toBe(true)
      })
    })

    it('debe rechazar zona inválida', () => {
      const invalidZoneData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '+34612345678',
        partySize: 2,
        date: '2025-09-15',
        time: '20:00',
        tableId: 'table_001',
        tableZone: 'INVALID_ZONE' as any,
        privacyPolicyAccepted: true,
        termsAccepted: true,
      }
      
      const result = schema.safeParse(invalidZoneData)
      expect(result.success).toBe(false)
    })
  })

  describe('Special Requirements Validation', () => {
    const schema = createReservationSchema('es')

    it('debe permitir specialRequests dentro del límite', () => {
      const validRequest = 'A'.repeat(500) // Exactamente 500 caracteres
      
      const testData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '+34612345678',
        partySize: 2,
        date: '2025-09-15',
        time: '20:00',
        tableId: 'table_001',
        tableZone: 'TERRACE' as const,
        specialRequests: validRequest,
        privacyPolicyAccepted: true,
        termsAccepted: true,
      }
      
      const result = schema.safeParse(testData)
      expect(result.success).toBe(true)
    })

    it('debe rechazar specialRequests que exceda el límite', () => {
      const longRequest = 'A'.repeat(501) // Excede 500 caracteres
      
      const testData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '+34612345678',
        partySize: 2,
        date: '2025-09-15',
        time: '20:00',
        tableId: 'table_001',
        tableZone: 'TERRACE' as const,
        specialRequests: longRequest,
        privacyPolicyAccepted: true,
        termsAccepted: true,
      }
      
      const result = schema.safeParse(testData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const requestError = result.error.issues.find(issue => issue.path.includes('specialRequests'))
        expect(requestError?.message).toBe('Máximo 500 caracteres')
      }
    })
  })

  describe('Error Messages Consistency', () => {
    it('debe tener todos los mensajes requeridos en español', () => {
      const esMessages = errorMessages.es
      
      expect(esMessages.nameRequired).toBeDefined()
      expect(esMessages.emailRequired).toBeDefined()
      expect(esMessages.phoneRequired).toBeDefined()
      expect(esMessages.privacyRequired).toBeDefined()
      expect(esMessages.termsRequired).toBeDefined()
    })

    it('debe tener todos los mensajes requeridos en inglés', () => {
      const enMessages = errorMessages.en
      
      expect(enMessages.nameRequired).toBeDefined()
      expect(enMessages.emailRequired).toBeDefined()
      expect(enMessages.phoneRequired).toBeDefined()
      expect(enMessages.privacyRequired).toBeDefined()
      expect(enMessages.termsRequired).toBeDefined()
    })

    it('debe tener la misma estructura en ambos idiomas', () => {
      const esKeys = Object.keys(errorMessages.es).sort()
      const enKeys = Object.keys(errorMessages.en).sort()
      
      expect(esKeys).toEqual(enKeys)
    })
  })
})