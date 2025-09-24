// src/lib/supabase/index.ts
// Barrel exports for Supabase configuration

// Re-export main client and types
export { supabase, type Database } from './client'
export { default as supabaseClient } from './client'

// Re-export helper functions
export {
  getTablesByZone,
  getReservationsByDate,
  checkTableAvailability,
  subscribeToTableUpdates,
  subscribeToReservationUpdates,
  testConnection
} from './client'

// Export default client for convenience
export { supabase as default } from './client'