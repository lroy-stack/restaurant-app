import { NextRequest, NextResponse } from 'next/server'
import { testDatabaseConnection, getDataCounts } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    
    // Test basic connection
    const connectionTest = await testDatabaseConnection()
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionTest.error,
        databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Missing'
      }, { status: 500 })
    }
    
    // Get data counts if connection works
    const dataCountsResult = await getDataCounts()
    
    return NextResponse.json({
      success: true,
      connection: 'OK',
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Missing',
      dataAccess: dataCountsResult.success,
      counts: dataCountsResult.counts,
      error: dataCountsResult.error
    })
    
  } catch (error) {
    console.error('Test DB API error:', error)
    return NextResponse.json({
      success: false,
      error: 'API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}