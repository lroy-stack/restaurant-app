// Email Queue System for Background Processing
// Handles asynchronous email sending with retry logic and rate limiting
// Integrates with email_logs table for tracking and monitoring

import { EmailService } from '../email/emailService'
import { createServiceClient } from '@/utils/supabase/server'
import { EmailType, EmailResult } from '../email/types/emailTypes'

export interface EmailJob {
  id: string
  type: EmailType
  recipient: string
  data: Record<string, any>
  priority: number // 1-10, higher = more priority
  scheduledFor: Date
  attempts: number
  maxAttempts: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface QueueConfig {
  maxConcurrent: number
  retryDelay: number // milliseconds
  rateLimit: number // emails per minute
  batchSize: number
}

export class EmailQueue {
  private static instance: EmailQueue | null = null
  private emailService: EmailService
  private config: QueueConfig
  private processing: boolean = false
  private activeJobs: Set<string> = new Set()
  private lastEmailTime: number = 0

  private constructor(config: Partial<QueueConfig> = {}) {
    this.emailService = EmailService.getInstance()
    this.config = {
      maxConcurrent: 3,
      retryDelay: 5000, // 5 seconds
      rateLimit: 30, // 30 emails per minute (Titan.email limit)
      batchSize: 5,
      ...config
    }
  }

  static getInstance(config?: Partial<QueueConfig>): EmailQueue {
    if (!EmailQueue.instance) {
      EmailQueue.instance = new EmailQueue(config)
    }
    return EmailQueue.instance
  }

  // Add email job to queue
  async addJob(
    type: EmailType,
    recipient: string,
    data: Record<string, any>,
    options: {
      priority?: number
      scheduledFor?: Date
      maxAttempts?: number
    } = {}
  ): Promise<string> {
    const jobId = crypto.randomUUID()
    const job: EmailJob = {
      id: jobId,
      type,
      recipient,
      data,
      priority: options.priority || 5,
      scheduledFor: options.scheduledFor || new Date(),
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Store job in email_schedule table
    const supabase = await createServiceClient()
    const { error } = await supabase
      .from('email_schedule')
      .insert({
        schedule_id: jobId,
        reservation_id: data.reservationId || null,
        customer_id: data.customerId || null,
        email_type: type,
        scheduled_for: job.scheduledFor.toISOString(),
        priority_level: job.priority,
        email_data: job.data,
        status: 'PENDING',
        attempts: 0,
        max_attempts: job.maxAttempts
      })

    if (error) {
      console.error('Failed to schedule email job:', error)
      throw new Error(`Failed to schedule email: ${error.message}`)
    }

    console.log(`Email job ${jobId} added to queue:`, {
      type,
      recipient,
      scheduledFor: job.scheduledFor,
      priority: job.priority
    })

    // Start processing if not already running
    if (!this.processing) {
      this.startProcessing()
    }

    return jobId
  }

  // Start the queue processor
  async startProcessing(): Promise<void> {
    if (this.processing) return

    this.processing = true
    console.log('Email queue processing started')

    while (this.processing) {
      try {
        await this.processBatch()
        await this.sleep(1000) // 1 second between batch checks
      } catch (error) {
        console.error('Email queue processing error:', error)
        await this.sleep(5000) // 5 seconds on error
      }
    }
  }

  // Stop the queue processor
  stopProcessing(): void {
    this.processing = false
    console.log('Email queue processing stopped')
  }

  // Process a batch of pending emails
  private async processBatch(): Promise<void> {
    if (this.activeJobs.size >= this.config.maxConcurrent) {
      return
    }

    // Get pending jobs from database
    const supabase = await createServiceClient()
    const { data: scheduleItems, error } = await supabase
      .from('email_schedule')
      .select('*')
      .eq('status', 'PENDING')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority_level', { ascending: false })
      .order('scheduled_for', { ascending: true })
      .limit(this.config.batchSize)

    if (error) {
      console.error('Failed to fetch email jobs:', error)
      return
    }

    if (!scheduleItems || scheduleItems.length === 0) {
      return
    }

    // Process jobs concurrently
    const jobPromises = scheduleItems
      .slice(0, this.config.maxConcurrent - this.activeJobs.size)
      .map(item => this.processJob(item))

    await Promise.allSettled(jobPromises)
  }

  // Process individual email job
  private async processJob(scheduleItem: any): Promise<void> {
    const jobId = scheduleItem.schedule_id

    if (this.activeJobs.has(jobId)) {
      return
    }

    this.activeJobs.add(jobId)

    try {
      // Update status to processing
      await supabase
        .from('email_schedule')
        .update({
          status: 'PROCESSING',
          updated_at: new Date().toISOString()
        })
        .eq('schedule_id', jobId)

      // Rate limiting
      await this.enforceRateLimit()

      // Send email
      const emailResult = await this.sendEmail(scheduleItem)

      if (emailResult.success) {
        // Mark as completed
        await supabase
          .from('email_schedule')
          .update({
            status: 'COMPLETED',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('schedule_id', jobId)

        console.log(`Email job ${jobId} completed successfully`)
      } else {
        // Handle failure with retry logic
        await this.handleJobFailure(scheduleItem, emailResult.error)
      }

    } catch (error) {
      console.error(`Email job ${jobId} processing error:`, error)
      await this.handleJobFailure(scheduleItem, error as Error)
    } finally {
      this.activeJobs.delete(jobId)
    }
  }

  // Send email using EmailService
  private async sendEmail(scheduleItem: any): Promise<EmailResult> {
    const emailData = {
      ...scheduleItem.email_data,
      customerEmail: scheduleItem.email_data.customerEmail || scheduleItem.email_data.recipient
    }

    switch (scheduleItem.email_type) {
      case EmailType.ReservationCreated:
        return await this.emailService.sendReservationConfirmation(emailData)

      case EmailType.ReservationConfirmed:
        return await this.emailService.sendReservationConfirmed(emailData)

      case EmailType.ReservationReminder:
        return await this.emailService.sendReservationReminder(emailData)

      case EmailType.ReservationReview:
        return await this.emailService.sendReviewRequest(emailData)

      case EmailType.ReservationCancelled:
        return await this.emailService.sendCancellation(emailData)

      default:
        throw new Error(`Unsupported email type: ${scheduleItem.email_type}`)
    }
  }

  // Handle job failure with retry logic
  private async handleJobFailure(scheduleItem: any, error: Error): Promise<void> {
    const attempts = scheduleItem.attempts + 1
    const maxAttempts = scheduleItem.max_attempts

    if (attempts >= maxAttempts) {
      // Mark as failed
      await supabase
        .from('email_schedule')
        .update({
          status: 'FAILED',
          attempts: attempts,
          error_message: error.message,
          failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('schedule_id', scheduleItem.schedule_id)

      console.error(`Email job ${scheduleItem.schedule_id} failed permanently:`, error.message)
    } else {
      // Schedule retry
      const retryDelay = this.config.retryDelay * Math.pow(2, attempts - 1) // Exponential backoff
      const nextRetry = new Date(Date.now() + retryDelay)

      await supabase
        .from('email_schedule')
        .update({
          status: 'PENDING',
          attempts: attempts,
          scheduled_for: nextRetry.toISOString(),
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('schedule_id', scheduleItem.schedule_id)

      console.log(`Email job ${scheduleItem.schedule_id} scheduled for retry ${attempts}/${maxAttempts} at ${nextRetry}`)
    }
  }

  // Enforce rate limiting (Titan.email: 30 emails/minute)
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    const minInterval = (60 * 1000) / this.config.rateLimit // milliseconds between emails

    if (this.lastEmailTime && (now - this.lastEmailTime) < minInterval) {
      const waitTime = minInterval - (now - this.lastEmailTime)
      await this.sleep(waitTime)
    }

    this.lastEmailTime = Date.now()
  }

  // Get queue statistics
  async getQueueStats(): Promise<{
    pending: number
    processing: number
    completed: number
    failed: number
    activeJobs: number
  }> {
    const { data: stats } = await supabase
      .from('email_schedule')
      .select('status')

    const counts = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      activeJobs: this.activeJobs.size
    }

    if (stats) {
      stats.forEach(item => {
        switch (item.status) {
          case 'PENDING':
            counts.pending++
            break
          case 'PROCESSING':
            counts.processing++
            break
          case 'COMPLETED':
            counts.completed++
            break
          case 'FAILED':
            counts.failed++
            break
        }
      })
    }

    return counts
  }

  // Cancel a specific job
  async cancelJob(jobId: string): Promise<boolean> {
    if (this.activeJobs.has(jobId)) {
      console.warn(`Cannot cancel job ${jobId}: currently processing`)
      return false
    }

    const supabase = await createServiceClient()
    const { error } = await supabase
      .from('email_schedule')
      .update({
        status: 'CANCELLED',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('schedule_id', jobId)
      .eq('status', 'PENDING')

    if (error) {
      console.error('Failed to cancel job:', error)
      return false
    }

    console.log(`Email job ${jobId} cancelled`)
    return true
  }

  // Utility method for sleeping
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Singleton instance
export const emailQueue = EmailQueue.getInstance()