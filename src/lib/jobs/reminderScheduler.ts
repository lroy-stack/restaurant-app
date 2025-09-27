// Reminder Scheduler for Automatic Email Triggers
// Schedules reminder emails 12 hours before reservation time
// Monitors reservation changes and updates email schedules accordingly

import { createServiceClient } from '@/utils/supabase/server'
import { emailQueue } from './emailQueue'
import { EmailType } from '../email/types/emailTypes'
import { buildTokenUrl, buildProductionUrl } from '../email/config/emailConfig'

export interface ReminderJob {
  reservationId: string
  customerId: string
  customerEmail: string
  reservationDateTime: Date
  reminderTime: Date
  jobId?: string
}

export class ReminderScheduler {
  private static instance: ReminderScheduler | null = null
  private monitoring: boolean = false
  private monitoringInterval: number = 60000 // 1 minute

  private constructor() {}

  static getInstance(): ReminderScheduler {
    if (!ReminderScheduler.instance) {
      ReminderScheduler.instance = new ReminderScheduler()
    }
    return ReminderScheduler.instance
  }

  // Schedule reminder for a specific reservation
  async scheduleReminder(
    reservationId: string,
    reservationDateTime: Date,
    customerData: {
      customerId: string
      customerEmail: string
      customerName: string
    }
  ): Promise<string | null> {
    // Calculate reminder time (12 hours before reservation)
    const reminderTime = new Date(reservationDateTime.getTime() - (12 * 60 * 60 * 1000))

    // Don't schedule if reminder time is in the past
    if (reminderTime <= new Date()) {
      console.log(`Skipping reminder for reservation ${reservationId}: reminder time is in the past`)
      return null
    }

    try {
      // Get full reservation details for email
      const supabase = await createServiceClient()
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .select(`
          *,
          customers(*),
          restaurants(*),
          tables(*)
        `)
        .eq('reservation_id', reservationId)
        .single()

      if (reservationError || !reservation) {
        console.error('Failed to fetch reservation for reminder:', reservationError)
        return null
      }

      // Prepare email data
      const emailData = {
        customerName: customerData.customerName,
        customerEmail: customerData.customerEmail,
        customerId: customerData.customerId,
        reservationId: reservation.reservation_id,
        reservationDate: new Date(reservation.reservation_date).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        reservationTime: reservation.reservation_time,
        partySize: reservation.party_size,
        tableLocation: reservation.tables?.location || 'Por asignar',
        tableNumber: reservation.tables?.table_number || null,
        specialRequests: reservation.special_requests,
        preOrderItems: [], // TODO: Add pre-order items from reservation_items
        preOrderTotal: 0,
        restaurantName: reservation.restaurants?.name || 'Enigma Cocina Con Alma',
        restaurantEmail: reservation.restaurants?.email || process.env.RESTAURANT_EMAIL || 'reservas@enigmaconalma.com',
        restaurantPhone: reservation.restaurants?.phone || process.env.RESTAURANT_PHONE || '+34 123 456 789',
        tokenUrl: buildTokenUrl(reservation.token)
      }

      // Schedule reminder email in queue
      const jobId = await emailQueue.addJob(
        'REMINDER' as EmailType,
        customerData.customerEmail,
        emailData,
        {
          priority: 7, // High priority for reminders
          scheduledFor: reminderTime,
          maxAttempts: 3
        }
      )

      console.log(`Reminder scheduled for reservation ${reservationId}:`, {
        reservationTime: reservationDateTime,
        reminderTime,
        jobId
      })

      return jobId

    } catch (error) {
      console.error('Failed to schedule reminder:', error)
      return null
    }
  }

  // Schedule reminders for all confirmed reservations without existing reminders
  async scheduleAllPendingReminders(): Promise<number> {
    try {
      // Get all confirmed reservations in the future without existing reminder jobs
      const supabase = await createServiceClient()
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select(`
          reservation_id,
          reservation_date,
          reservation_time,
          customers(id, firstName, lastName, email),
          restaurants(name, email, phone)
        `)
        .eq('status', 'CONFIRMED')
        .gte('reservation_date', new Date().toISOString().split('T')[0])
        .is('reminder_scheduled', null) // Assuming we add this flag

      if (error) {
        console.error('Failed to fetch reservations for reminder scheduling:', error)
        return 0
      }

      if (!reservations || reservations.length === 0) {
        console.log('No reservations found that need reminder scheduling')
        return 0
      }

      let scheduledCount = 0

      for (const reservation of reservations) {
        if (!reservation.customers) continue

        // Combine date and time
        const reservationDateTime = new Date(`${reservation.reservation_date}T${reservation.reservation_time}`)

        const jobId = await this.scheduleReminder(
          reservation.reservation_id,
          reservationDateTime,
          {
            customerId: reservation.customers.customer_id,
            customerEmail: reservation.customers.email,
            customerName: reservation.customers.name
          }
        )

        if (jobId) {
          // Mark as scheduled in database
          const supabaseUpdate = await createServiceClient()
          await supabaseUpdate
            .from('reservations')
            .update({
              reminder_scheduled: true,
              reminder_job_id: jobId
            })
            .eq('reservation_id', reservation.reservation_id)

          scheduledCount++
        }
      }

      console.log(`Scheduled ${scheduledCount} reminder emails`)
      return scheduledCount

    } catch (error) {
      console.error('Failed to schedule pending reminders:', error)
      return 0
    }
  }

  // Cancel reminder for a specific reservation
  async cancelReminder(reservationId: string): Promise<boolean> {
    try {
      // Get the reminder job ID from reservation
      const supabase = await createServiceClient()
      const { data: reservation } = await supabase
        .from('reservations')
        .select('reminder_job_id')
        .eq('reservation_id', reservationId)
        .single()

      if (reservation?.reminder_job_id) {
        const cancelled = await emailQueue.cancelJob(reservation.reminder_job_id)

        if (cancelled) {
          // Clear reminder flags
          const supabaseUpdate = await createServiceClient()
          await supabaseUpdate
            .from('reservations')
            .update({
              reminder_scheduled: false,
              reminder_job_id: null
            })
            .eq('reservation_id', reservationId)

          console.log(`Cancelled reminder for reservation ${reservationId}`)
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Failed to cancel reminder:', error)
      return false
    }
  }

  // Update reminder when reservation changes
  async updateReminder(
    reservationId: string,
    newDateTime: Date,
    customerData: {
      customerId: string
      customerEmail: string
      customerName: string
    }
  ): Promise<string | null> {
    // Cancel existing reminder
    await this.cancelReminder(reservationId)

    // Schedule new reminder
    return await this.scheduleReminder(reservationId, newDateTime, customerData)
  }

  // Start monitoring for reservation changes
  startMonitoring(): void {
    if (this.monitoring) return

    this.monitoring = true
    console.log('Reminder scheduler monitoring started')

    // Initial batch scheduling
    this.scheduleAllPendingReminders()

    // Set up periodic monitoring
    setInterval(async () => {
      if (!this.monitoring) return

      try {
        await this.scheduleAllPendingReminders()
        await this.cleanupExpiredReminders()
      } catch (error) {
        console.error('Reminder scheduler monitoring error:', error)
      }
    }, this.monitoringInterval)
  }

  // Stop monitoring
  stopMonitoring(): void {
    this.monitoring = false
    console.log('Reminder scheduler monitoring stopped')
  }

  // Clean up expired reminder jobs
  private async cleanupExpiredReminders(): Promise<void> {
    try {
      // Cancel reminder jobs for past reservations
      const supabase = await createServiceClient()
      const { data: expiredJobs } = await supabase
        .from('email_schedule')
        .select('schedule_id, reservation_id')
        .eq('email_type', 'REMINDER')
        .eq('status', 'PENDING')
        .lt('scheduled_for', new Date().toISOString())

      if (expiredJobs && expiredJobs.length > 0) {
        console.log(`Cleaning up ${expiredJobs.length} expired reminder jobs`)

        for (const job of expiredJobs) {
          await emailQueue.cancelJob(job.schedule_id)

          // Clear reservation reminder flags
          if (job.reservation_id) {
            const supabaseUpdate = await createServiceClient()
            await supabaseUpdate
              .from('reservations')
              .update({
                reminder_scheduled: false,
                reminder_job_id: null
              })
              .eq('reservation_id', job.reservation_id)
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup expired reminders:', error)
    }
  }

  // Schedule review request emails (2 hours after reservation end)
  async scheduleReviewRequest(
    reservationId: string,
    reservationEndTime: Date,
    customerData: {
      customerId: string
      customerEmail: string
      customerName: string
    }
  ): Promise<string | null> {
    // Calculate review request time (2 hours after reservation end)
    const reviewTime = new Date(reservationEndTime.getTime() + (2 * 60 * 60 * 1000))

    try {
      // Get reservation details
      const supabase = await createServiceClient()
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .select(`
          *,
          customers(*),
          restaurants(*),
          tables(*)
        `)
        .eq('reservation_id', reservationId)
        .single()

      if (reservationError || !reservation) {
        console.error('Failed to fetch reservation for review request:', reservationError)
        return null
      }

      // Prepare email data
      const emailData = {
        customerName: customerData.customerName,
        customerEmail: customerData.customerEmail,
        customerId: customerData.customerId,
        reservationId: reservation.reservation_id,
        reservationDate: new Date(reservation.reservation_date).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        reservationTime: reservation.reservation_time,
        partySize: reservation.party_size,
        restaurantName: reservation.restaurants?.name || 'Enigma Cocina Con Alma',
        restaurantEmail: reservation.restaurants?.email || process.env.RESTAURANT_EMAIL || 'reservas@enigmaconalma.com',
        restaurantPhone: reservation.restaurants?.phone || process.env.RESTAURANT_PHONE || '+34 123 456 789',
        tokenUrl: buildTokenUrl(reservation.token)
      }

      // Schedule review request email
      const jobId = await emailQueue.addJob(
        'REVIEW_REQUEST' as EmailType,
        customerData.customerEmail,
        emailData,
        {
          priority: 5, // Medium priority
          scheduledFor: reviewTime,
          maxAttempts: 2
        }
      )

      console.log(`Review request scheduled for reservation ${reservationId}:`, {
        reservationEndTime,
        reviewTime,
        jobId
      })

      return jobId

    } catch (error) {
      console.error('Failed to schedule review request:', error)
      return null
    }
  }

  // Get scheduler statistics
  async getSchedulerStats(): Promise<{
    totalScheduled: number
    pendingReminders: number
    pendingReviews: number
    failedJobs: number
  }> {
    const supabase = await createServiceClient()
    const { data: stats } = await supabase
      .from('email_schedule')
      .select('email_type, status')
      .in('email_type', ['REMINDER', 'REVIEW_REQUEST'])

    const counts = {
      totalScheduled: 0,
      pendingReminders: 0,
      pendingReviews: 0,
      failedJobs: 0
    }

    if (stats) {
      stats.forEach(item => {
        counts.totalScheduled++

        if (item.status === 'PENDING') {
          if (item.email_type === 'REMINDER') counts.pendingReminders++
          if (item.email_type === 'REVIEW_REQUEST') counts.pendingReviews++
        }

        if (item.status === 'FAILED') counts.failedJobs++
      })
    }

    return counts
  }
}

// Export singleton instance
export const reminderScheduler = ReminderScheduler.getInstance()