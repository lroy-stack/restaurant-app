import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET endpoint for retrieving all allergens
export async function GET() {
  try {
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      {
        db: {
          schema: 'public'
        }
      }
    )

    // Fetch all allergens from the database
    const { data: allergens, error: allergensError } = await supabase
      .from('allergens')
      .select('*')
      .order('name', { ascending: true })

    if (allergensError) {
      console.error('Allergens query error:', allergensError)
      return NextResponse.json(
        {
          success: false,
          error: 'Error fetching allergens',
          details: allergensError.message
        },
        { status: 500 }
      )
    }

    // Transform the data to include additional metadata
    const transformedAllergens = (allergens || []).map((allergen: any) => ({
      id: allergen.id,
      name: allergen.name,
      nameEn: allergen.nameEn,
      description: allergen.description,
      icon: allergen.icon,
      createdAt: allergen.created_at,
      updatedAt: allergen.updated_at
    }))

    // Calculate statistics
    const stats = {
      totalAllergens: transformedAllergens.length,
      commonAllergens: transformedAllergens.filter((a: any) =>
        ['gluten', 'lacteo', 'huevo', 'frutos secos', 'pescado', 'soja'].some(common =>
          a.name.toLowerCase().includes(common)
        )
      ).length,
      eu14Allergens: transformedAllergens.filter((a: any) =>
        [
          'gluten', 'crustaceos', 'huevos', 'pescado', 'cacahuetes',
          'soja', 'leche', 'frutos secos', 'apio', 'mostaza',
          'sesamo', 'sulfitos', 'altramuces', 'moluscos'
        ].some(eu14 => a.name.toLowerCase().includes(eu14.replace('ñ', 'n')))
      ).length
    }

    return NextResponse.json({
      success: true,
      allergens: transformedAllergens,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('GET allergens API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}