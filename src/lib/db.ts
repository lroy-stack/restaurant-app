// src/lib/db.ts - Prisma Database Client for Enigma Restaurant
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Connection test utility
export async function testDatabaseConnection() {
  try {
    await db.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    return { success: true, error: null }
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Test data counts utility
export async function getDataCounts() {
  try {
    const [reservations, users, menuItems, tables] = await Promise.all([
      db.reservation.count(),
      db.user.count(), 
      db.menuItem.count(),
      db.table.count()
    ])
    
    return {
      success: true,
      counts: { reservations, users, menuItems, tables }
    }
  } catch (error) {
    console.error('❌ Failed to get data counts:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      counts: null
    }
  }
}

// Schema validation utility
export async function validateDatabaseSchema() {
  try {
    // Test that the 'restaurante' schema exists and has our tables
    const tables = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'restaurante'
      ORDER BY table_name;
    ` as Array<{ table_name: string }>

    const expectedTables = [
      'users',
      'customers',
      'accounts', 
      'sessions',
      'verification_tokens',
      'restaurants',
      'tables',
      'reservations',
      'reservation_items',
      'menu_categories',
      'menu_items',
      'allergens',
      'menu_item_allergens',
      'wine_pairings',
      'orders',
      'order_items'
    ]

    const foundTables = tables.map(t => t.table_name)
    const missingTables = expectedTables.filter(table => !foundTables.includes(table))
    
    if (missingTables.length === 0) {
      console.log('✅ All required tables found in restaurante schema')
      return true
    } else {
      console.error('❌ Missing tables in restaurante schema:', missingTables)
      return false
    }
  } catch (error) {
    console.error('❌ Schema validation failed:', error)
    return false
  }
}