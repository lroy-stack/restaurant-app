import { createBrowserClient } from '@supabase/ssr'

// Configuración de Supabase usando variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Cliente público para operaciones del cliente (sin restricción de schema)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Cliente específico para esquema público (migrado desde 'restaurante')
export const supabasePublic = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: (process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'public') as 'public' | 'restaurante'
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Backward compatibility - alias para código existente
export const supabaseRestaurante = supabasePublic

// Note: supabaseAdmin is moved to server-only module for security
// Use createAdminClient() from @/lib/supabase/server for admin operations

// Tipos de Database para TypeScript (basados en esquema restaurante)
export interface Database {
  restaurante: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          email: string
          website: string | null
          description: string | null
          cuisine_type: string | null
          price_range: string | null
          capacity: number | null
          opening_hours: Record<string, unknown> | null
          social_media: Record<string, unknown> | null
          features: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          email: string
          website?: string | null
          description?: string | null
          cuisine_type?: string | null
          price_range?: string | null
          capacity?: number | null
          opening_hours?: Record<string, unknown> | null
          social_media?: Record<string, unknown> | null
          features?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          email?: string
          website?: string | null
          description?: string | null
          cuisine_type?: string | null
          price_range?: string | null
          capacity?: number | null
          opening_hours?: Record<string, unknown> | null
          social_media?: Record<string, unknown> | null
          features?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      tables: {
        Row: {
          id: string
          restaurant_id: string
          table_number: number
          capacity: number
          zone: string
          position_x: number | null
          position_y: number | null
          is_active: boolean
          qr_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          table_number: number
          capacity: number
          zone: string
          position_x?: number | null
          position_y?: number | null
          is_active?: boolean
          qr_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          table_number?: number
          capacity?: number
          zone?: string
          position_x?: number | null
          position_y?: number | null
          is_active?: boolean
          qr_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          customer_id: string
          table_id: string
          reservation_date: string
          reservation_time: string
          party_size: number
          duration: number
          status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show'
          special_requests: string | null
          dietary_notes: string | null
          occasion: string | null
          pre_order_items: Record<string, unknown>[] | null
          pre_order_total: number
          total_estimated: number | null
          customer_notes: string | null
          internal_notes: string | null
          created_at: string
          updated_at: string
          confirmed_at: string | null
          seated_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          table_id: string
          reservation_date: string
          reservation_time: string
          party_size: number
          duration?: number
          status?: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show'
          special_requests?: string | null
          dietary_notes?: string | null
          occasion?: string | null
          pre_order_items?: Record<string, unknown>[] | null
          pre_order_total?: number
          total_estimated?: number | null
          customer_notes?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
          confirmed_at?: string | null
          seated_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          table_id?: string
          reservation_date?: string
          reservation_time?: string
          party_size?: number
          duration?: number
          status?: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show'
          special_requests?: string | null
          dietary_notes?: string | null
          occasion?: string | null
          pre_order_items?: Record<string, unknown>[] | null
          pre_order_total?: number
          total_estimated?: number | null
          customer_notes?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
          confirmed_at?: string | null
          seated_at?: string | null
          completed_at?: string | null
        }
      }
      customers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          language: string
          is_vip: boolean
          dietary_preferences: string[] | null
          preferences: Record<string, unknown> | null
          notes: string | null
          created_at: string
          updated_at: string
          last_visit: string | null
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          language?: string
          is_vip?: boolean
          dietary_preferences?: string[] | null
          preferences?: Record<string, unknown> | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          last_visit?: string | null
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          language?: string
          is_vip?: boolean
          dietary_preferences?: string[] | null
          preferences?: Record<string, unknown> | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          last_visit?: string | null
        }
      }
      menu_categories: {
        Row: {
          id: string
          name: string
          name_en: string | null
          description: string | null
          description_en: string | null
          type: 'FOOD' | 'WINE' | 'BEVERAGE'
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          description?: string | null
          description_en?: string | null
          type?: 'FOOD' | 'WINE' | 'BEVERAGE'
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          description?: string | null
          description_en?: string | null
          type?: 'FOOD' | 'WINE' | 'BEVERAGE'
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          category_id: string
          name: string
          name_en: string | null
          description: string | null
          description_en: string | null
          price: number
          is_signature: boolean
          is_new: boolean
          is_seasonal_special: boolean
          is_vegetarian: boolean
          is_vegan: boolean
          is_gluten_free: boolean
          is_lactose_free: boolean
          contains_gluten: boolean
          contains_milk: boolean
          contains_eggs: boolean
          contains_nuts: boolean
          contains_fish: boolean
          contains_shellfish: boolean
          contains_soy: boolean
          contains_celery: boolean
          contains_mustard: boolean
          contains_sesame: boolean
          contains_sulfites: boolean
          contains_lupin: boolean
          contains_mollusks: boolean
          contains_peanuts: boolean
          images: string[] | null
          display_order: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          name_en?: string | null
          description?: string | null
          description_en?: string | null
          price: number
          is_signature?: boolean
          is_new?: boolean
          is_seasonal_special?: boolean
          is_vegetarian?: boolean
          is_vegan?: boolean
          is_gluten_free?: boolean
          is_lactose_free?: boolean
          contains_gluten?: boolean
          contains_milk?: boolean
          contains_eggs?: boolean
          contains_nuts?: boolean
          contains_fish?: boolean
          contains_shellfish?: boolean
          contains_soy?: boolean
          contains_celery?: boolean
          contains_mustard?: boolean
          contains_sesame?: boolean
          contains_sulfites?: boolean
          contains_lupin?: boolean
          contains_mollusks?: boolean
          contains_peanuts?: boolean
          images?: string[] | null
          display_order?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          name_en?: string | null
          description?: string | null
          description_en?: string | null
          price?: number
          is_signature?: boolean
          is_new?: boolean
          is_seasonal_special?: boolean
          is_vegetarian?: boolean
          is_vegan?: boolean
          is_gluten_free?: boolean
          is_lactose_free?: boolean
          contains_gluten?: boolean
          contains_milk?: boolean
          contains_eggs?: boolean
          contains_nuts?: boolean
          contains_fish?: boolean
          contains_shellfish?: boolean
          contains_soy?: boolean
          contains_celery?: boolean
          contains_mustard?: boolean
          contains_sesame?: boolean
          contains_sulfites?: boolean
          contains_lupin?: boolean
          contains_mollusks?: boolean
          contains_peanuts?: boolean
          images?: string[] | null
          display_order?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_complete_menu: {
        Args: Record<string, never>
        Returns: Record<string, unknown>[]
      }
      check_table_availability: {
        Args: {
          p_date: string
          p_time: string
          p_party_size: number
          p_duration?: number
          p_table_zone?: string
          p_table_id?: string
        }
        Returns: Record<string, unknown>[]
      }
      create_reservation: {
        Args: {
          p_reservation_id: string
          p_customer_data: Record<string, unknown>
          p_reservation_data: Record<string, unknown>
        }
        Returns: Record<string, unknown>
      }
      get_reservations: {
        Args: {
          p_status?: string
          p_date?: string
          p_customer_id?: string
          p_table_id?: string
          p_page?: number
          p_limit?: number
          p_sort_by?: string
          p_sort_order?: string
          p_include_stats?: boolean
        }
        Returns: Record<string, unknown>
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper functions para esquema restaurante
export const getTablesByZone = async (zone: string) => {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('zone', zone)
    .eq('is_active', true)
    .order('table_number')

  if (error) throw error
  return data
}

export const getReservationsByDate = async (date: string) => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      customers (*),
      tables (*)
    `)
    .eq('reservation_date', date)
    .in('status', ['pending', 'confirmed', 'seated'])
    .order('reservation_time')

  if (error) throw error
  return data
}

export const checkTableAvailability = async (
  tableId: string,
  date: string,
  time: string,
  duration: number = 120
) => {
  const { data, error } = await supabase.rpc('check_table_availability', {
    p_table_id: tableId,
    p_date: date,
    p_time: time,
    p_duration: duration
  })

  if (error) throw error
  return data
}

// Real-time subscriptions con esquema dinámico
const SCHEMA = (process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'public') as 'public' | 'restaurante'

export const subscribeToTableUpdates = (callback: (payload: Record<string, unknown>) => void) => {
  return supabase
    .channel('table-updates')
    .on('postgres_changes', {
      event: '*',
      schema: SCHEMA,
      table: 'tables'
    }, callback)
    .subscribe()
}

export const subscribeToReservationUpdates = (callback: (payload: Record<string, unknown>) => void) => {
  return supabase
    .channel('reservation-updates')
    .on('postgres_changes', {
      event: '*',
      schema: SCHEMA,
      table: 'reservations'
    }, callback)
    .subscribe()
}

// Validación de conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1)

    return !error
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return false
  }
}

export default supabase