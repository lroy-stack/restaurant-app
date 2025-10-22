/**
 * Configuración centralizada de Supabase para Restaurant App
 * ⚠️ Este proyecto usa schema 'public' (migrado desde 'restaurante')
 *
 * @module supabase/config
 * @see CENTRALIZATION_PLAN.md
 */

// Validación de variables requeridas
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}. Check .env.local`);
  }
});

/**
 * Configuración de Supabase
 */
export const SUPABASE_CONFIG = {
  // URLs y keys desde .env.local
  url: requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY,

  // ⚠️ IMPORTANTE: Este proyecto usa schema 'public'
  schema: (process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'public') as 'public' | 'restaurante',

  // Headers pre-construidos
  headers: {
    common: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'apikey': requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    admin: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY,
    }
  }
} as const;

/**
 * Helper: Headers con schema dinámico
 * @param useServiceRole - Si true, usa service role key; si false, usa anon key
 * @returns Headers completos para fetch
 */
export function getSupabaseHeaders(useServiceRole = false): Record<string, string> {
  const base = useServiceRole
    ? SUPABASE_CONFIG.headers.admin
    : {
        ...SUPABASE_CONFIG.headers.common,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
      };

  return {
    ...base,
    'Accept-Profile': SUPABASE_CONFIG.schema,
    'Content-Profile': SUPABASE_CONFIG.schema,
  };
}

/**
 * Helper: Construir URL de API REST de Supabase
 * @param endpoint - Endpoint sin barra inicial (ej: 'reservations', 'rpc/get_menu')
 * @returns URL completa
 */
export function getSupabaseApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${SUPABASE_CONFIG.url}/rest/v1/${cleanEndpoint}`;
}

/**
 * Helper: Construir URL de Realtime
 * @returns URL de realtime
 */
export function getSupabaseRealtimeUrl(): string {
  return `${SUPABASE_CONFIG.url}/realtime/v1`;
}

/**
 * Validación de conexión a la base de datos
 * @returns Promise<boolean> - true si la conexión es exitosa
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const response = await fetch(getSupabaseApiUrl('restaurants?limit=1'), {
      headers: getSupabaseHeaders()
    });
    return response.ok;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Helper: Get full Supabase configuration for debugging
 * ⚠️ NO usar en producción - expone información sensible
 */
export function getDebugConfig() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('getDebugConfig() should not be called in production');
  }

  return {
    url: SUPABASE_CONFIG.url,
    schema: SUPABASE_CONFIG.schema,
    hasAnonKey: !!SUPABASE_CONFIG.anonKey,
    hasServiceKey: !!SUPABASE_CONFIG.serviceRoleKey,
    anonKeyPrefix: SUPABASE_CONFIG.anonKey.substring(0, 20) + '...',
  };
}
