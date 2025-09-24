// Job Manager - Initialize and manage background job processing
// Handles graceful startup/shutdown of email queue and reminder scheduler
// Provides health checks and monitoring for background jobs

import { emailQueue, EmailQueue } from './emailQueue'
import { reminderScheduler, ReminderScheduler } from './reminderScheduler'

export class JobManager {
  private static instance: JobManager | null = null
  private initialized: boolean = false
  private healthCheckInterval: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): JobManager {
    if (!JobManager.instance) {
      JobManager.instance = new JobManager()
    }
    return JobManager.instance
  }

  // Initialize all background job systems
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('Job manager already initialized')
      return
    }

    try {
      console.log('🚀 Initializing email job processing system...')

      // Start email queue processing
      await emailQueue.startProcessing()
      console.log('✅ Email queue processor started')

      // Start reminder scheduler monitoring
      reminderScheduler.startMonitoring()
      console.log('✅ Reminder scheduler started')

      // Start health monitoring
      this.startHealthMonitoring()
      console.log('✅ Health monitoring started')

      this.initialized = true
      console.log('🎉 Email job processing system fully initialized')

    } catch (error) {
      console.error('❌ Failed to initialize job manager:', error)
      throw error
    }
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      console.log('Job manager not initialized, nothing to shutdown')
      return
    }

    try {
      console.log('🛑 Shutting down email job processing system...')

      // Stop health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval)
        this.healthCheckInterval = null
      }

      // Stop reminder scheduler
      reminderScheduler.stopMonitoring()
      console.log('✅ Reminder scheduler stopped')

      // Stop email queue processing
      emailQueue.stopProcessing()
      console.log('✅ Email queue processor stopped')

      this.initialized = false
      console.log('🎉 Email job processing system gracefully shut down')

    } catch (error) {
      console.error('❌ Error during job manager shutdown:', error)
      throw error
    }
  }

  // Health monitoring
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) return

    // Check every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck()
      } catch (error) {
        console.error('Health check failed:', error)
      }
    }, 5 * 60 * 1000)
  }

  // Perform health check
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'unhealthy'
    details: Record<string, any>
  }> {
    try {
      // Get queue statistics
      const queueStats = await emailQueue.getQueueStats()
      const schedulerStats = await reminderScheduler.getSchedulerStats()

      // Calculate health metrics
      const totalActiveJobs = queueStats.pending + queueStats.processing
      const failureRate = queueStats.failed / (queueStats.completed + queueStats.failed || 1)

      // Determine health status
      let status: 'healthy' | 'warning' | 'unhealthy' = 'healthy'

      if (failureRate > 0.1) { // More than 10% failure rate
        status = 'unhealthy'
      } else if (totalActiveJobs > 100 || failureRate > 0.05) { // Queue backing up or 5% failure rate
        status = 'warning'
      }

      const healthReport = {
        status,
        details: {
          timestamp: new Date().toISOString(),
          emailQueue: queueStats,
          reminderScheduler: schedulerStats,
          metrics: {
            totalActiveJobs,
            failureRate: Math.round(failureRate * 100 * 100) / 100 // Percentage with 2 decimals
          }
        }
      }

      // Log warnings or errors
      if (status !== 'healthy') {
        console.warn(`📊 Email system health check: ${status}`, healthReport.details)
      } else {
        console.log(`💚 Email system healthy - Queue: ${totalActiveJobs} active, Failure rate: ${(failureRate * 100).toFixed(1)}%`)
      }

      return healthReport

    } catch (error) {
      console.error('Health check error:', error)
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  // Get system status
  async getStatus(): Promise<{
    initialized: boolean
    emailQueue: any
    reminderScheduler: any
    health: any
  }> {
    return {
      initialized: this.initialized,
      emailQueue: this.initialized ? await emailQueue.getQueueStats() : null,
      reminderScheduler: this.initialized ? await reminderScheduler.getSchedulerStats() : null,
      health: this.initialized ? await this.performHealthCheck() : null
    }
  }

  // Force restart all services
  async restart(): Promise<void> {
    console.log('🔄 Restarting email job processing system...')
    await this.shutdown()
    await this.initialize()
  }

  // Emergency operations
  async emergencyStop(): Promise<void> {
    console.log('🚨 Emergency stop of email job processing system')

    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval)
        this.healthCheckInterval = null
      }

      reminderScheduler.stopMonitoring()
      emailQueue.stopProcessing()
      this.initialized = false

      console.log('✅ Emergency stop completed')
    } catch (error) {
      console.error('❌ Error during emergency stop:', error)
    }
  }

  // Utility methods for manual operations
  async scheduleRemindersForAllReservations(): Promise<number> {
    console.log('📅 Manually scheduling reminders for all confirmed reservations...')
    return await reminderScheduler.scheduleAllPendingReminders()
  }

  async getDetailedStats(): Promise<{
    system: any
    queue: any
    scheduler: any
    health: any
  }> {
    if (!this.initialized) {
      return {
        system: { initialized: false },
        queue: null,
        scheduler: null,
        health: null
      }
    }

    return {
      system: {
        initialized: this.initialized,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      },
      queue: await emailQueue.getQueueStats(),
      scheduler: await reminderScheduler.getSchedulerStats(),
      health: await this.performHealthCheck()
    }
  }
}

// Export singleton instance
export const jobManager = JobManager.getInstance()

// Graceful shutdown handling
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('📧 Received SIGINT, shutting down job manager gracefully...')
    await jobManager.shutdown()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('📧 Received SIGTERM, shutting down job manager gracefully...')
    await jobManager.shutdown()
    process.exit(0)
  })

  process.on('uncaughtException', async (error) => {
    console.error('❌ Uncaught exception, emergency stop of job manager:', error)
    await jobManager.emergencyStop()
    process.exit(1)
  })
}