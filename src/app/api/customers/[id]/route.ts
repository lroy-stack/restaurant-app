import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { updateCustomerSchema } from '@/lib/validations/customer'

export const dynamic = 'force-dynamic'

// GET specific customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServiceClient()

    const { data: customer, error } = await supabase
      .schema('public')
      .from('customers')
      .select('*')
      .eq('id', (await params).id)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Get customer's reservations
    const { data: reservations } = await supabase
      .schema('public')
      .from('reservations')
      .select('*')
      .eq('customerEmail', customer.email)
      .order('createdAt', { ascending: false })

    // Calculate statistics
    const totalReservations = reservations?.length || 0
    const totalSpent = reservations?.reduce((sum, r) => {
      if (r.status === 'COMPLETED') {
        return sum + (r.partySize * 45) // Average €45 per person
      }
      return sum
    }, 0) || 0
    
    const lastVisit = reservations?.[0]?.createdAt || null

    const enrichedCustomer = {
      ...customer,
      totalReservations,
      totalSpent,
      lastVisit,
      reservations: reservations || []
    }

    return NextResponse.json({
      success: true,
      customer: enrichedCustomer
    })

  } catch (error) {
    console.error('GET customer error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update customer
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    console.log('🔍 PATCH /api/customers/[id] received body:', JSON.stringify(body, null, 2))

    // Validate with proper schema from lib/validations/customer.ts
    const validationResult = updateCustomerSchema.safeParse(body)

    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.format())
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid data',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data
    console.log('✅ Validation passed:', JSON.stringify(data, null, 2))

    // SANITIZE: Convert empty strings to null for timestamp fields
    const sanitizedData = {
      ...data,
      dateOfBirth: data.dateOfBirth === '' ? null : data.dateOfBirth,
      preferredTime: data.preferredTime === '' ? null : data.preferredTime,
      preferredLocation: data.preferredLocation === '' ? null : data.preferredLocation,
      allergies: data.allergies === '' ? null : data.allergies,
      phone: data.phone === '' ? null : data.phone,
      email: data.email === '' ? null : data.email
    }

    const supabase = await createServiceClient()

    // Update customer with validated data
    const { data: updatedCustomer, error } = await supabase
      .schema('public')
      .from('customers')
      .update({
        ...sanitizedData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', (await params).id)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase update error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update customer',
          details: error.message
        },
        { status: 500 }
      )
    }

    console.log('✅ Customer updated successfully:', updatedCustomer.id)
    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
      message: 'Customer updated successfully'
    })

  } catch (error) {
    console.error('❌ Unexpected error in PATCH /api/customers/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE customer (GDPR compliance)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServiceClient()

    // Get customer first to check if exists
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('email')
      .eq('id', (await params).id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // ELIMINACIÓN COMPLETA - TODO EL REGISTRO DEL CLIENTE

    // 1. Eliminar reservas completamente
    const { error: reservationError } = await supabase
      .from('reservations')
      .delete()
      .eq('customerEmail', customer.email)

    if (reservationError) {
      console.error('Error eliminando reservas:', reservationError)
    }

    // 2. Eliminar políticas GDPR
    const { error: gdprError } = await supabase
      .from('cookie_consents')
      .delete()
      .eq('customer_id', (await params).id)

    if (gdprError) {
      console.error('Error eliminando políticas GDPR:', gdprError)
    }

    // Delete customer record
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', (await params).id)

    if (deleteError) {
      console.error('Delete customer error:', deleteError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete customer',
          details: deleteError.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente eliminado completamente de la base de datos'
    })

  } catch (error) {
    console.error('DELETE customer error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}