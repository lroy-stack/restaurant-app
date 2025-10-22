import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'
import { jobManager } from '@/lib/jobs/jobManager'

export const dynamic = 'force-dynamic'

// GET endpoint para estadísticas del sistema de emails
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceClient()

    // Obtener estadísticas de emails enviados desde logs
    const { data: emailLogs, error: logsError } = await supabase
      .schema('public')
      .from('email_logs')
      .select('email_type, status, sent_at, created_at')
      .order('created_at', { ascending: false })
      .limit(1000) // Últimos 1000 emails

    if (logsError) {
      console.error('❌ Error obteniendo logs de email:', logsError)
    }

    // Obtener estadísticas de emails programados
    const { data: scheduledEmails, error: scheduleError } = await supabase
      .schema('public')
      .from('email_schedule')
      .select('email_type, status, scheduled_for, created_at, attempts')
      .order('created_at', { ascending: false })
      .limit(500) // Últimos 500 emails programados

    if (scheduleError) {
      console.error('❌ Error obteniendo emails programados:', scheduleError)
    }

    // Calcular estadísticas de envío
    const emailStats = {
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000))
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Procesar logs de emails enviados
    if (emailLogs) {
      emailLogs.forEach(log => {
        emailStats.total++

        // Contar por estado
        emailStats.byStatus[log.status] = (emailStats.byStatus[log.status] || 0) + 1

        if (log.status === 'SENT' || log.status === 'DELIVERED') {
          emailStats.successful++
        } else if (log.status === 'FAILED' || log.status === 'BOUNCED') {
          emailStats.failed++
        }

        // Contar por tipo
        emailStats.byType[log.email_type] = (emailStats.byType[log.email_type] || 0) + 1

        // Contar por período de tiempo
        const sentDate = new Date(log.sent_at || log.created_at)
        if (sentDate >= today) {
          emailStats.today++
        }
        if (sentDate >= thisWeek) {
          emailStats.thisWeek++
        }
        if (sentDate >= thisMonth) {
          emailStats.thisMonth++
        }
      })
    }

    // Procesar emails programados
    const scheduleStats = {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      averageAttempts: 0
    }

    if (scheduledEmails) {
      let totalAttempts = 0

      scheduledEmails.forEach(schedule => {
        scheduleStats.total++
        totalAttempts += schedule.attempts || 0

        switch (schedule.status) {
          case 'PENDING':
            scheduleStats.pending++
            emailStats.pending++
            break
          case 'PROCESSING':
            scheduleStats.processing++
            break
          case 'COMPLETED':
            scheduleStats.completed++
            break
          case 'FAILED':
            scheduleStats.failed++
            break
          case 'CANCELLED':
            scheduleStats.cancelled++
            break
        }
      })

      scheduleStats.averageAttempts = scheduleStats.total > 0
        ? Math.round((totalAttempts / scheduleStats.total) * 100) / 100
        : 0
    }

    // Obtener estado del sistema de trabajos
    const systemStatus = await jobManager.getDetailedStats()

    // Calcular métricas de rendimiento
    const performanceMetrics = {
      successRate: emailStats.total > 0
        ? Math.round((emailStats.successful / emailStats.total) * 100 * 100) / 100
        : 0,
      failureRate: emailStats.total > 0
        ? Math.round((emailStats.failed / emailStats.total) * 100 * 100) / 100
        : 0,
      averagePerDay: emailStats.thisMonth > 0
        ? Math.round((emailStats.thisMonth / now.getDate()) * 100) / 100
        : 0
    }

    // Obtener próximos emails programados
    const { data: upcomingEmails, error: upcomingError } = await supabase
      .schema('public')
      .from('email_schedule')
      .select(`
        email_type,
        scheduled_for,
        email_data,
        priority_level,
        attempts
      `)
      .eq('status', 'PENDING')
      .gte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(10)

    const upcomingList = upcomingEmails?.map(email => ({
      type: email.email_type,
      scheduledFor: email.scheduled_for,
      customerName: email.email_data?.customerName || 'N/A',
      priority: email.priority_level,
      attempts: email.attempts
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEmails: emailStats.total,
          successfulEmails: emailStats.successful,
          failedEmails: emailStats.failed,
          pendingEmails: emailStats.pending,
          todayEmails: emailStats.today,
          thisWeekEmails: emailStats.thisWeek,
          thisMonthEmails: emailStats.thisMonth
        },
        performance: performanceMetrics,
        breakdown: {
          byType: emailStats.byType,
          byStatus: emailStats.byStatus
        },
        schedule: scheduleStats,
        system: systemStatus,
        upcoming: upcomingList,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de email:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// POST endpoint para operaciones de gestión
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, params } = body

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Parámetro action requerido' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'restart_jobs':
        console.log('🔄 Reiniciando sistema de trabajos de email...')
        await jobManager.restart()
        result = { message: 'Sistema de trabajos reiniciado correctamente' }
        break

      case 'health_check':
        result = await jobManager.performHealthCheck()
        break

      case 'schedule_reminders':
        const { reminderScheduler } = await import('@/lib/jobs/reminderScheduler')
        const scheduled = await reminderScheduler.scheduleAllPendingReminders()
        result = {
          message: `Se programaron ${scheduled} recordatorios`,
          scheduledCount: scheduled
        }
        break

      case 'clear_failed_jobs':
        if (!params?.confirm) {
          return NextResponse.json(
            { success: false, error: 'Confirmación requerida para limpiar trabajos fallidos' },
            { status: 400 }
          )
        }

        const supabase = await createServiceClient()
        const { error: clearError } = await supabase
          .schema('public')
          .from('email_schedule')
          .delete()
          .eq('status', 'FAILED')

        if (clearError) {
          throw new Error(`Error limpiando trabajos fallidos: ${clearError.message}`)
        }

        result = { message: 'Trabajos fallidos limpiados correctamente' }
        break

      default:
        return NextResponse.json(
          { success: false, error: `Acción no válida: ${action}` },
          { status: 400 }
        )
    }

    console.log(`✅ Acción ejecutada correctamente: ${action}`)

    return NextResponse.json({
      success: true,
      action,
      result,
      executedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error ejecutando acción de gestión:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Error ejecutando acción',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}