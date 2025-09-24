'use client'

import { useState, useEffect, useCallback } from 'react'

interface CriticalSystemStatus {
  walFiles: {
    status: 'healthy' | 'warning' | 'critical'
    count: number
    action: 'cleanup_recommended' | 'normal'
    details: string
  }
  connections: {
    status: 'healthy' | 'warning' | 'critical'
    total: number
    active: number
    idle: number
    idle_in_transaction: number
    action: 'kill_idle_recommended' | 'normal'
    details: string
  }
  maintenance: {
    status: 'healthy' | 'info' | 'warning'
    tables_needing_attention: number
    action: 'vacuum_recommended' | 'normal'
    details: string
    high_activity_tables: Array<{
      name: string
      activity: number
      last_vacuum: string | null
    }>
  }
}

interface SystemStatusResponse {
  success: boolean
  status: CriticalSystemStatus
  timestamp: string
  error?: string
}

interface MaintenanceResponse {
  success: boolean
  message: string
  operation?: string
  target?: string
  timestamp?: string
  error?: string
  details?: string
}

export function useSystemStatus() {
  const [status, setStatus] = useState<CriticalSystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/system/status')
      const data: SystemStatusResponse = await response.json()

      if (data.success) {
        setStatus(data.status)
      } else {
        setError(data.error || 'Failed to fetch system status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  // CRITICAL FUNCTION 1: VACUUM & ANALYZE
  const runVacuum = useCallback(async (table?: string, operation: 'vacuum_only' | 'analyze_only' | 'vacuum_analyze' = 'vacuum_analyze') => {
    try {
      setActionLoading('vacuum')

      const response = await fetch('/api/system/vacuum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, operation })
      })

      const data: MaintenanceResponse = await response.json()

      if (data.success) {
        // Refetch status after vacuum
        await fetchStatus()
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error || 'Failed to run vacuum' }
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    } finally {
      setActionLoading(null)
    }
  }, [fetchStatus])

  // CRITICAL FUNCTION 2: WAL CLEANUP
  const cleanupWAL = useCallback(async () => {
    try {
      setActionLoading('wal')

      const response = await fetch('/api/system/cleanup-wal', {
        method: 'POST'
      })

      const data: MaintenanceResponse = await response.json()

      if (data.success) {
        // Refetch status after cleanup
        await fetchStatus()
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error || 'Failed to cleanup WAL files' }
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    } finally {
      setActionLoading(null)
    }
  }, [fetchStatus])

  // CRITICAL FUNCTION 3: KILL IDLE CONNECTIONS
  const killIdleConnections = useCallback(async (mode: 'idle_in_transaction' | 'long_idle' | 'long_running' = 'idle_in_transaction') => {
    try {
      setActionLoading('connections')

      const response = await fetch('/api/system/kill-idle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      })

      const data: MaintenanceResponse = await response.json()

      if (data.success) {
        // Refetch status after killing connections
        await fetchStatus()
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error || 'Failed to kill idle connections' }
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    } finally {
      setActionLoading(null)
    }
  }, [fetchStatus])

  useEffect(() => {
    fetchStatus()

    // Auto-refresh every 30 seconds for critical monitoring
    const interval = setInterval(fetchStatus, 30000)

    return () => clearInterval(interval)
  }, [fetchStatus])

  return {
    status,
    loading,
    error,
    actionLoading,
    refetch: fetchStatus,
    // Critical maintenance functions
    runVacuum,
    cleanupWAL,
    killIdleConnections
  }
}