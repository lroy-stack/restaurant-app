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
          schema: 'public'
        }
      }
    )

    // Build customers query with REAL data from DB
    let customersQuery = supabase
      .from('customers')
      .select(`
        id,
        firstName,
        lastName,
        email,
        phone,
        isVip,
        totalSpent,
        totalVisits,
        lastVisit,
        emailConsent,
        marketingConsent,
        dataProcessingConsent,
        createdAt,
        updatedAt
      `)
      .order('totalSpent', { ascending: false })

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
        .select('customerId, customerEmail')
        .eq('status', 'COMPLETED')
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

    // Count reservations per customer
    const reservationsCountMap = new Map<string, number>()
    reservationsData.forEach(reservation => {
      if (reservation.customerId) {
        reservationsCountMap.set(
          reservation.customerId,
          (reservationsCountMap.get(reservation.customerId) || 0) + 1
        )
      }
    })

    // Calculate loyalty tier based on totalSpent
    const calculateLoyaltyTier = (totalSpent: number): string => {
      if (totalSpent >= 500) return 'ORO'
      if (totalSpent >= 200) return 'PLATA'
      if (totalSpent >= 50) return 'BRONCE'
      return 'NUEVO'
    }

    // Enrich customers with computed data
    const enrichedCustomers = customers?.map(customer => {
      const totalReservations = reservationsCountMap.get(customer.id) || 0
      const loyaltyTier = calculateLoyaltyTier(customer.totalSpent || 0)

      return {
        ...customer,
        totalReservations,
        loyaltyTier,
        averageSpending: customer.totalVisits > 0
          ? Math.round(customer.totalSpent / customer.totalVisits)
          : 0,
        visitFrequency: customer.totalVisits >= 5 ? 'HIGH' : customer.totalVisits >= 2 ? 'MEDIUM' : 'LOW',
        gdprConsent: customer.dataProcessingConsent,
      }
    }) || []

    // Calculate summary stats
    const now = new Date()
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    const summary = {
      total: enrichedCustomers.length,
      active: enrichedCustomers.filter(c => c.lastVisit && new Date(c.lastVisit) > oneMonthAgo).length,
      vip: enrichedCustomers.filter(c => c.isVip).length,
      inactive: enrichedCustomers.filter(c => !c.lastVisit || new Date(c.lastVisit) <= oneMonthAgo).length,
      newThisMonth: enrichedCustomers.filter(c => new Date(c.createdAt) > oneMonthAgo).length,
      totalRevenue: enrichedCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
      averageOrderValue: enrichedCustomers.length > 0
        ? Math.round(enrichedCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / enrichedCustomers.length)
        : 0
    }

    return NextResponse.json({
      success: true,
      customers: enrichedCustomers,
      summary,
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
          schema: 'public'
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