'use client'

// Jobs Provider - Initializes background job processing for the application
// Handles client-side initialization of email queue and reminder scheduler
// Provides job status context throughout the app

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { initializeJobs, isJobsInitialized, getJobsStatus } from '@/lib/jobs/initializeJobs'

interface JobsContextType {
  initialized: boolean
  status: any
  error: string | null
  refresh: () => Promise<void>
}

const JobsContext = createContext<JobsContextType | undefined>(undefined)

interface JobsProviderProps {
  children: ReactNode
}

export function JobsProvider({ children }: JobsProviderProps) {
  const [initialized, setInitialized] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const refreshStatus = async () => {
    try {
      const jobStatus = await getJobsStatus()
      setStatus(jobStatus)
      setInitialized(jobStatus.initialized || false)
    } catch (err) {
      console.error('Failed to get job status:', err)
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  useEffect(() => {
    let mounted = true

    const initJobs = async () => {
      try {
        // Only initialize on client side and in suitable environments
        if (typeof window === 'undefined') return

        console.log('🚀 Initializing background jobs from JobsProvider...')

        await initializeJobs()

        if (mounted) {
          setInitialized(isJobsInitialized())
          await refreshStatus()
          console.log('✅ Background jobs initialized via JobsProvider')
        }
      } catch (err) {
        console.error('❌ Failed to initialize jobs from provider:', err)

        if (mounted) {
          setError(err instanceof Error ? err.message : String(err))
          setInitialized(false)
        }
      }
    }

    // Initialize jobs
    initJobs()

    // Set up periodic status refresh
    const statusInterval = setInterval(() => {
      if (mounted) {
        refreshStatus()
      }
    }, 30000) // Every 30 seconds

    return () => {
      mounted = false
      clearInterval(statusInterval)
    }
  }, [])

  const contextValue: JobsContextType = {
    initialized,
    status,
    error,
    refresh: refreshStatus
  }

  return (
    <JobsContext.Provider value={contextValue}>
      {children}
    </JobsContext.Provider>
  )
}

// Hook to use jobs context
export function useJobs(): JobsContextType {
  const context = useContext(JobsContext)
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider')
  }
  return context
}

// Optional status display component for debugging
export function JobsStatusIndicator() {
  const { initialized, status, error } = useJobs()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-md p-2 text-xs shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            initialized
              ? 'bg-green-500'
              : error
              ? 'bg-red-500'
              : 'bg-yellow-500'
          }`}
        />
        <span className="font-medium">
          Jobs: {initialized ? 'Active' : error ? 'Error' : 'Initializing'}
        </span>
      </div>

      {status && (
        <div className="mt-1 text-muted-foreground">
          Queue: {status.emailQueue?.pending || 0} pending, {status.emailQueue?.failed || 0} failed
        </div>
      )}

      {error && (
        <div className="mt-1 text-red-600 text-xs truncate max-w-[200px]" title={error}>
          {error}
        </div>
      )}
    </div>
  )
}