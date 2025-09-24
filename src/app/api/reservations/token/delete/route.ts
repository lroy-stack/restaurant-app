import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * 🔐 SECURE TOKEN DELETE API
 * Server-side endpoint para eliminar tokens de reserva
 * Evita exposer service role key en client-side
 */
export async function DELETE(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Token inválido'
      }, { status: 400 })
    }

    console.log('🔒 Server-side token deletion:', token.substring(0, 8) + '...')

    const supabase = await createServiceClient()

    // Delete token using server-side service client
    const { error } = await supabase
      .schema('restaurante')
      .from('reservation_tokens')
      .delete()
      .eq('token', token)

    if (error) {
      console.error('❌ Token deletion failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Error al eliminar token'
      }, { status: 500 })
    }

    console.log('✅ Token deleted successfully')
    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('❌ Token deletion error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno'
    }, { status: 500 })
  }
}