import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        db: {
          schema: 'restaurante'
        }
      }
    )

    // Test direct access to customers table
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, firstName, lastName, email')
      .limit(3)

    // Test direct access to reservations table
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('id, customerName, customerEmail')
      .limit(3)

    return NextResponse.json({
      success: true,
      tests: {
        customers: {
          error: customersError?.message || null,
          count: customers?.length || 0,
          sample: customers?.[0] || null
        },
        reservations: {
          error: reservationsError?.message || null,
          count: reservations?.length || 0,
          sample: reservations?.[0] || null
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}