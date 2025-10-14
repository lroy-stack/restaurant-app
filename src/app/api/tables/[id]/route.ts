import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface TableUpdateData {
  number?: string
  capacity?: number
  location?: string
  isActive?: boolean
  is_public?: boolean // Controls visibility in public web form
  currentStatus?: 'available' | 'reserved' | 'occupied' | 'maintenance'
  statusNotes?: string | null
  estimatedFreeTime?: string | null
  // Position fields for drag and drop functionality
  position_x?: number
  position_y?: number
  width?: number
  height?: number
  rotation?: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tableId } = await params

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?id=eq.${tableId}&select=*`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch table: ${response.status}`)
    }

    const tables = await response.json()
    
    if (tables.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Table not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      table: tables[0]
    })
  } catch (error) {
    console.error('Error fetching table:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch table' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tableId } = await params
    const updateData: TableUpdateData = await request.json()

    // Validate location if provided
    if (updateData.location) {
      const validLocations = ['TERRACE_CAMPANARI', 'SALA_PRINCIPAL', 'SALA_VIP', 'TERRACE_JUSTICIA']
      if (!validLocations.includes(updateData.location)) {
        return NextResponse.json(
          { success: false, error: 'Invalid location' },
          { status: 400 }
        )
      }
    }

    // Validate capacity if provided
    if (updateData.capacity && (updateData.capacity < 1 || updateData.capacity > 20)) {
      return NextResponse.json(
        { success: false, error: 'Capacity must be between 1 and 20' },
        { status: 400 }
      )
    }

    // Validate status if provided
    if (updateData.currentStatus) {
      const validStatuses = ['available', 'reserved', 'occupied', 'maintenance']
      if (!validStatuses.includes(updateData.currentStatus)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        )
      }
    }

    // Validate position if provided
    if (updateData.position_x !== undefined && isNaN(updateData.position_x)) {
      return NextResponse.json(
        { success: false, error: 'Invalid position_x value' },
        { status: 400 }
      )
    }

    if (updateData.position_y !== undefined && isNaN(updateData.position_y)) {
      return NextResponse.json(
        { success: false, error: 'Invalid position_y value' },
        { status: 400 }
      )
    }

    // Validate dimensions if provided
    if (updateData.width !== undefined && (updateData.width < 40 || updateData.width > 300)) {
      return NextResponse.json(
        { success: false, error: 'Width must be between 40 and 300 pixels' },
        { status: 400 }
      )
    }

    if (updateData.height !== undefined && (updateData.height < 40 || updateData.height > 200)) {
      return NextResponse.json(
        { success: false, error: 'Height must be between 40 and 200 pixels' },
        { status: 400 }
      )
    }

    if (updateData.rotation !== undefined && (updateData.rotation < 0 || updateData.rotation >= 360)) {
      return NextResponse.json(
        { success: false, error: 'Rotation must be between 0 and 360 degrees' },
        { status: 400 }
      )
    }

    // Add updatedAt timestamp
    const updatePayload = {
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?id=eq.${tableId}`,
      {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updatePayload)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Update table error:', response.status, errorText)
      throw new Error(`Failed to update table: ${response.status}`)
    }

    const updatedTable = await response.json()
    
    if (updatedTable.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Table not found' },
        { status: 404 }
      )
    }

    console.log('✅ Table updated:', updatedTable[0]?.number || 'Unknown')
    
    return NextResponse.json({
      success: true,
      table: updatedTable[0],
      message: 'Table updated successfully'
    })
  } catch (error) {
    console.error('Error updating table:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to update table' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tableId } = await params

    // First check if table exists
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?id=eq.${tableId}&select=number,currentStatus`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    if (!checkResponse.ok) {
      throw new Error(`Failed to check table: ${checkResponse.status}`)
    }

    const tables = await checkResponse.json()
    
    if (tables.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Table not found' },
        { status: 404 }
      )
    }

    const table = tables[0]

    // Prevent deletion of occupied or reserved tables
    if (table.currentStatus === 'occupied' || table.currentStatus === 'reserved') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete table ${table.number} while it is ${table.currentStatus}` 
        },
        { status: 400 }
      )
    }

    // Delete the table
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?id=eq.${tableId}`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Delete table error:', response.status, errorText)
      throw new Error(`Failed to delete table: ${response.status}`)
    }

    console.log('✅ Table deleted:', table.number)
    
    return NextResponse.json({
      success: true,
      message: `Table ${table.number} deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting table:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete table' },
      { status: 500 }
    )
  }
}