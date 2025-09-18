// src/lib/supabase/auth.ts - Supabase Authentication Functions
import { supabase } from './client'
import { AuthError, User, Session } from '@supabase/supabase-js'

export interface AuthResult {
  success: boolean
  user?: User | null
  session?: Session | null
  error?: string
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    }
  } catch (error) {
    return {
      success: false,
      error: 'Error inesperado durante el login'
    }
  }
}

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, metadata?: any): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    }
  } catch (error) {
    return {
      success: false,
      error: 'Error inesperado durante el registro'
    }
  }
}

// Sign out
export const signOut = async (): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: 'Error durante el logout'
    }
  }
}

// Get current session
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting current session:', error)
    return null
  }
}

// Get current user
export const getCurrentSupabaseUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Reset password
export const resetPassword = async (email: string): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: 'Error al enviar email de recuperación'
    }
  }
}

// Update password
export const updatePassword = async (password: string): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: 'Error al actualizar contraseña'
    }
  }
}

// Auth state change listener
export const onAuthStateChange = (callback: (session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session)
  })
}

// Get user role from custom schema
export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      return null
    }

    return data?.role || 'CUSTOMER'
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

// Map Supabase auth errors to user-friendly messages
function getAuthErrorMessage(error: AuthError): string {
  const errorMessages: Record<string, string> = {
    'invalid_credentials': 'Email o contraseña incorrectos',
    'email_not_confirmed': 'Por favor confirma tu email antes de iniciar sesión',
    'signup_disabled': 'El registro está deshabilitado temporalmente',
    'email_address_invalid': 'Email inválido',
    'password_strength_insufficient': 'La contraseña debe tener al menos 6 caracteres',
    'user_already_registered': 'Ya existe una cuenta con este email',
    'session_not_found': 'Sesión no encontrada',
    'insufficient_privileges': 'Permisos insuficientes'
  }

  return errorMessages[error.message] || error.message || 'Error de autenticación'
}

// Auth utility functions for client-side
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  } catch {
    return false
  }
}

// Sync Supabase user with NextAuth user (utility)
export const syncUserWithDatabase = async (user: User) => {
  try {
    // Check if user exists in our custom users table
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing user:', fetchError)
      return
    }

    if (!existingUser) {
      // Create user in our custom table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
          role: 'CUSTOMER',
          emailVerified: new Date().toISOString(),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error creating user in database:', insertError)
      }
    }
  } catch (error) {
    console.error('Error syncing user with database:', error)
  }
}