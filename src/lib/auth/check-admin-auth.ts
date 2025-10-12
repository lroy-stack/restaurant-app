/**
 * Check if request comes from authenticated admin/staff user
 * Used to auto-confirm reservations created from admin panel
 */

import { createDirectAdminClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function checkAdminAuth(request: NextRequest): Promise<{
  isAdmin: boolean
  userId?: string
  userRole?: string
}> {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAdmin: false }
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify token and get user
    const supabase = createDirectAdminClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.log('❌ Auth check failed: No valid user')
      return { isAdmin: false }
    }

    // 🔐 CRITICAL: Check if user is STAFF (not just authenticated)
    // Public users can have valid tokens but are NOT staff
    const { data: staffUser, error: staffError } = await supabase
      .schema('restaurante')
      .from('users')
      .select('id, role, email')
      .eq('email', user.email)
      .single()

    if (staffError || !staffUser) {
      console.log('❌ User not found in restaurante.users:', user.email)
      return { isAdmin: false }
    }

    // Only ADMIN, MANAGER, STAFF can auto-confirm
    const validStaffRoles = ['ADMIN', 'MANAGER', 'STAFF']
    const isStaff = validStaffRoles.includes(staffUser.role)

    console.log(`✅ Auth check: ${user.email}, role=${staffUser.role}, isStaff=${isStaff}`)

    return {
      isAdmin: isStaff,
      userId: user.id,
      userRole: staffUser.role
    }

  } catch (error) {
    console.error('❌ Error checking admin auth:', error)
    return { isAdmin: false }
  }
}
