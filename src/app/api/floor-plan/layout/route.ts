import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface FloorPlanLayout {
  nodes: any[]
  viewport: {
    x: number
    y: number
    zoom: number
  }
  lastSaved: string
  version: string
}

export async function POST(request: NextRequest) {
  try {
    const body: { layout: FloorPlanLayout, timestamp: string } = await request.json()
    const { layout } = body

    if (!layout || typeof layout !== 'object') {
      return NextResponse.json(
        { success: false, error: 'layout object is required' },
        { status: 400 }
      )
    }

    // Validate layout structure
    if (!layout.nodes || !Array.isArray(layout.nodes)) {
      return NextResponse.json(
        { success: false, error: 'layout.nodes must be an array' },
        { status: 400 }
      )
    }

    console.log(`💾 Storing React Flow layout for ${layout.nodes.length} elements...`)

    // Save table positions to the tables table
    const tableNodes = layout.nodes.filter(node =>
      node.data?.elementType === 'table' && node.data?.table_id
    )

    for (const tableNode of tableNodes) {
      try {
        const updateResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/tables?id=eq.${tableNode.data.table_id}`,
          {
            method: 'PATCH',
            headers: {
              'Accept': 'application/json',
              'Accept-Profile': 'restaurante',
              'Content-Profile': 'restaurante',
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'apikey': SUPABASE_SERVICE_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              position_x: tableNode.position.x,
              position_y: tableNode.position.y,
              rotation: tableNode.data.rotation || 0,
              width: tableNode.data.size?.width || 120,
              height: tableNode.data.size?.height || 80
            })
          }
        )

        if (!updateResponse.ok) {
          console.warn(`Failed to update table ${tableNode.data.table_id} position`)
        }
      } catch (error) {
        console.warn(`Error updating table ${tableNode.data.table_id}:`, error)
      }
    }

    // Save other elements to floor_plan_elements table
    const otherElements = layout.nodes.filter(node =>
      node.data?.elementType !== 'table'
    )

    // Clear existing elements (for now - later we'll implement proper updates)
    if (otherElements.length > 0) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/floor_plan_elements?restaurant_id=eq.rest_enigma_001`,
        {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Accept-Profile': 'restaurante',
            'Content-Profile': 'restaurante',
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY
          }
        }
      )

      // Insert new elements
      const elementsToInsert = otherElements.map(node => ({
        restaurant_id: 'rest_enigma_001',
        element_type: node.data.elementType,
        position_x: node.position.x,
        position_y: node.position.y,
        width: node.data.size?.width || 100,
        height: node.data.size?.height || 100,
        rotation: node.data.rotation || 0,
        z_index: 0,
        style_data: node.data.style || {},
        element_data: {
          label: node.data.label,
          ...node.data
        }
      }))

      if (elementsToInsert.length > 0) {
        const insertResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/floor_plan_elements`,
          {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Accept-Profile': 'restaurante',
              'Content-Profile': 'restaurante',
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'apikey': SUPABASE_SERVICE_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(elementsToInsert)
          }
        )

        if (!insertResponse.ok) {
          console.warn('Failed to insert floor plan elements')
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Layout saved for ${layout.nodes.length} elements`,
      tables_updated: tableNodes.length,
      elements_saved: otherElements.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error saving floor plan layout:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save floor plan layout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Load tables with position data
    const tablesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?select=*&order=number`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY
        }
      }
    )

    // Load floor plan elements
    const elementsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/floor_plan_elements?restaurant_id=eq.rest_enigma_001&order=created_at`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Profile': 'restaurante',
          'Content-Profile': 'restaurante',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY
        }
      }
    )

    if (!tablesResponse.ok) {
      throw new Error(`Failed to fetch tables: ${tablesResponse.status}`)
    }

    const tables = await tablesResponse.json()
    const elements = elementsResponse.ok ? await elementsResponse.json() : []

    // Convert tables to nodes
    const tableNodes = tables.map((table: any) => ({
      id: `table_${table.id}`,
      type: 'table',
      position: {
        x: table.position_x || 0,
        y: table.position_y || 0
      },
      data: {
        elementType: 'table',
        size: {
          width: table.width || 120,
          height: table.height || 80
        },
        rotation: table.rotation || 0,
        style: {
          backgroundColor: '#f8f9fa',
          borderColor: '#dee2e6',
          borderWidth: 2,
          borderRadius: 8,
          shadow: true
        },
        label: `Mesa ${table.number}`,
        table_id: table.id,
        number: table.number,
        capacity: table.capacity,
        location: table.location,
        currentStatus: table.currentstatus,
        isActive: table.isActive
      },
      draggable: true,
      selectable: true,
      deletable: false
    }))

    // Convert elements to nodes
    const elementNodes = elements.map((element: any) => ({
      id: element.id,
      type: element.element_type,
      position: {
        x: element.position_x,
        y: element.position_y
      },
      data: {
        elementType: element.element_type,
        size: {
          width: element.width,
          height: element.height
        },
        rotation: element.rotation || 0,
        style: element.style_data || {},
        ...element.element_data
      },
      draggable: true,
      selectable: true,
      deletable: true
    }))

    const layout: FloorPlanLayout = {
      nodes: [...tableNodes, ...elementNodes],
      viewport: { x: 0, y: 0, zoom: 1 },
      lastSaved: new Date().toISOString(),
      version: '1.0.0'
    }

    return NextResponse.json({
      success: true,
      layout,
      tables_count: tableNodes.length,
      elements_count: elementNodes.length
    })

  } catch (error) {
    console.error('❌ Error fetching floor plan layout:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to fetch floor plan layout' },
      { status: 500 }
    )
  }
}