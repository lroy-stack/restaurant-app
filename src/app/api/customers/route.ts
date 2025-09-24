import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Customer schema for validation
const customerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  preferences: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  gdprConsent: z.boolean().default(true),
  marketingConsent: z.boolean().default(false)
})

// GET endpoint for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const vipStatus = searchParams.get('vipStatus')
    
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        db: {
          schema: 'restaurante'
        }
      }
    )

    // Build customers query
    let customersQuery = supabase
      .from('customers')
      .select('id, firstName, lastName, email, phone, isVip, createdAt, updatedAt')
      .order('createdAt', { ascending: false })

    // Apply search filter
    if (search) {
      customersQuery = customersQuery.or(`firstName.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // Apply VIP filter
    if (vipStatus && vipStatus !== 'all') {
      customersQuery = customersQuery.eq('isVip', vipStatus === 'true')
    }

    const [customersResult, reservationsResult] = await Promise.all([
      customersQuery,
      supabase
        .from('reservations')
        .select('customerEmail, partySize, status, createdAt')
    ])

    if (customersResult.error) {
      console.error('Customers query error:', customersResult.error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error fetching customers',
          details: customersResult.error.message
        },
        { status: 500 }
      )
    }

    if (reservationsResult.error) {
      console.error('Reservations query error:', reservationsResult.error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error fetching reservations',
          details: reservationsResult.error.message
        },
        { status: 500 }
      )
    }

    const customers = customersResult.data || []
    const reservationsData = reservationsResult.data || []

    const reservationsMap = new Map()
    reservationsData.forEach(reservation => {
      const email = reservation.customerEmail
      if (!reservationsMap.has(email)) {
        reservationsMap.set(email, {
          totalReservations: 0,
          totalSpent: 0,
          lastVisit: null
        })
      }
      
      const customerData = reservationsMap.get(email)
      customerData.totalReservations += 1
      
      // Simulate spending based on party size and status
      if (reservation.status === 'COMPLETED') {
        customerData.totalSpent += reservation.partySize * 45 // Average €45 per person
      }
      
      // Track last visit
      const reservationDate = new Date(reservation.createdAt)
      if (!customerData.lastVisit || reservationDate > new Date(customerData.lastVisit)) {
        customerData.lastVisit = reservation.createdAt
      }
    })

    // Enrich customers with computed data
    const enrichedCustomers = customers?.map(user => {
      const stats = reservationsMap.get(user.email) || {
        totalReservations: 0,
        totalSpent: 0,
        lastVisit: null
      }
      
      return {
        ...user,
        ...stats,
        loyaltyTier: 'BRONZE',
        averageSpending: stats.totalReservations > 0 ? Math.round(stats.totalSpent / stats.totalReservations) : 0,
        visitFrequency: 'LOW',
        preferences: null,
        allergies: [],
        gdprConsent: true,
        marketingConsent: false
      }
    }) || []

    return NextResponse.json({
      success: true,
      customers: enrichedCustomers,
      summary: {
        total: enrichedCustomers.length,
        active: 0,
        vip: enrichedCustomers.filter(c => c.isVip).length,
        inactive: 0,
        newThisMonth: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('GET API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST endpoint for creating new customers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = customerSchema.parse(body)

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        db: {
          schema: 'restaurante'
        }
      }
    )

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id, email')
      .eq('email', data.email)
      .single()

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer with this email already exists' },
        { status: 409 }
      )
    }

    // Create new customer
    const { data: newCustomer, error: insertError } = await supabase
      .from('customers')
      .insert({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        language: 'ES',
        isVip: false,
        gdprPolicyVersion: 'v1.0',
        consentMethod: 'web_form',
        dataProcessingConsent: true,
        consentDate: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating customer:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create customer', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      customer: newCustomer,
      message: 'Customer created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating customer:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}