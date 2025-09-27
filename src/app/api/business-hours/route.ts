/**
 * BUSINESS HOURS API ENDPOINT
 * 
 * Provides business hours and time slots for client-side components
 * Enterprise-grade validation with proper error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAvailableTimeSlots, getBusinessHours, validateTimeSlot, BusinessHours } from '@/lib/business-hours-server'
import { z } from 'zod'

// Request validation schemas
const TimeSlotsRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  currentDateTime: z.string().datetime().optional()
})

const ValidateSlotRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  currentDateTime: z.string().datetime().optional()
})

/**
 * NEW: Schedule formatting utility for dual shift display
 */
function formatDualSchedule(hours: BusinessHours): string {
  if (!hours.is_open && !hours.lunch_enabled) return 'Cerrado'

  const parts = []
  if (hours.lunch_enabled && hours.lunch_open_time && hours.lunch_close_time) {
    parts.push(`${hours.lunch_open_time}-${hours.lunch_close_time}`)
  }
  if (hours.is_open && hours.open_time && hours.close_time) {
    parts.push(`${hours.open_time}-${hours.close_time}`)
  }

  return parts.join(' y ') || 'Cerrado'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'hours': {
        // Get business hours configuration
        const businessHours = await getBusinessHours()

        return NextResponse.json({
          success: true,
          data: businessHours.map(h => ({
            ...h,
            hasLunchService: h.lunch_enabled || false,
            hasDinnerService: h.is_open,
            scheduleDisplay: formatDualSchedule(h)
          })),
          meta: {
            timezone: 'Europe/Madrid',
            lastUpdated: new Date().toISOString(),
            dualShiftEnabled: true
          }
        })
      }

      case 'slots': {
        // Get available time slots for date
        const date = searchParams.get('date')
        const currentDateTimeParam = searchParams.get('currentDateTime')
        
        if (!date) {
          return NextResponse.json({
            success: false,
            error: 'Date parameter is required'
          }, { status: 400 })
        }

        // Validate request
        const validationResult = TimeSlotsRequestSchema.safeParse({
          date,
          currentDateTime: currentDateTimeParam || undefined
        })

        if (!validationResult.success) {
          return NextResponse.json({
            success: false,
            error: 'Invalid request parameters',
            details: validationResult.error.issues
          }, { status: 400 })
        }

        const currentDateTime = currentDateTimeParam 
          ? new Date(currentDateTimeParam) 
          : new Date()

        const slots = await getAvailableTimeSlots(date, currentDateTime)

        return NextResponse.json({
          success: true,
          data: {
            date,
            slots,
            shiftBreakdown: {
              lunch: slots.filter(s => s.shiftType === 'lunch'),
              dinner: slots.filter(s => s.shiftType === 'dinner'),
              gapPeriod: '16:00-18:30'
            },
            totalSlots: slots.length,
            availableSlots: slots.filter(s => s.available).length,
            requestedAt: currentDateTime.toISOString()
          }
        })
      }

      case 'validate': {
        // Validate specific time slot
        const date = searchParams.get('date')
        const time = searchParams.get('time')
        const currentDateTimeParam = searchParams.get('currentDateTime')
        
        if (!date || !time) {
          return NextResponse.json({
            success: false,
            error: 'Date and time parameters are required'
          }, { status: 400 })
        }

        // Validate request
        const validationResult = ValidateSlotRequestSchema.safeParse({
          date,
          time,
          currentDateTime: currentDateTimeParam || undefined
        })

        if (!validationResult.success) {
          return NextResponse.json({
            success: false,
            error: 'Invalid request parameters',
            details: validationResult.error.issues
          }, { status: 400 })
        }

        const currentDateTime = currentDateTimeParam 
          ? new Date(currentDateTimeParam) 
          : new Date()

        const validation = await validateTimeSlot(date, time, currentDateTime)
        
        return NextResponse.json({
          success: true,
          data: {
            date,
            time,
            ...validation,
            validatedAt: currentDateTime.toISOString()
          }
        })
      }

      default: {
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter',
          availableActions: ['hours', 'slots', 'validate']
        }, { status: 400 })
      }
    }

  } catch (error) {
    console.error('❌ [BUSINESS_HOURS_API] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// POST endpoint for bulk operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, dates } = body

    if (action === 'bulk-slots' && Array.isArray(dates)) {
      // Get slots for multiple dates
      const currentDateTime = body.currentDateTime ? new Date(body.currentDateTime) : new Date()
      
      const results = await Promise.all(
        dates.map(async (date: string) => {
          try {
            const slots = await getAvailableTimeSlots(date, currentDateTime)
            return {
              date,
              success: true,
              slots
            }
          } catch (error) {
            return {
              date,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        })
      )

      return NextResponse.json({
        success: true,
        data: results,
        requestedAt: currentDateTime.toISOString()
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid POST action or parameters'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ [BUSINESS_HOURS_API_POST] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}