import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const vipUpdateSchema = z.object({
  isVip: z.boolean()
})

// PATCH update VIP status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { isVip } = vipUpdateSchema.parse(body)

    const supabase = await createServiceClient()

    // Check if customer exists first
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('id, "firstName", "lastName", email, isVip')
      .eq('id', (await params).id)
      .single()

    if (fetchError || !existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Update VIP status
    const { data: updatedCustomer, error: updateError } = await supabase
      .from('customers')
      .update({
        isVip,
        updatedAt: new Date().toISOString()
      })
      .eq('id', (await params).id)
      .select()
      .single()

    if (updateError) {
      console.error('VIP status update error:', updateError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update VIP status',
          details: updateError.message
        },
        { status: 500 }
      )
    }

    // Log VIP status change for audit
    console.log(`VIP status changed for customer ${existingCustomer.firstName} ${existingCustomer.lastName} (${existingCustomer.email}): ${existingCustomer.isVip} -> ${isVip}`)

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
      message: `Customer ${isVip ? 'promoted to' : 'removed from'} VIP status successfully`,
      previousVipStatus: existingCustomer.isVip,
      newVipStatus: isVip
    })

  } catch (error) {
    console.error('VIP update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid VIP status data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}