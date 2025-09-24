// Job Initialization for Next.js Application
// Ensures background job processing starts when the application boots
// Handles development vs production initialization patterns

import { jobManager } from './jobManager'

let initialized = false
let initializationPromise: Promise<void> | null = null

// Initialize jobs - safe to call multiple times
export async function initializeJobs(): Promise<void> {
  // Return existing promise if initialization is in progress
  if (initializationPromise) {
    return initializationPromise
  }

  // Skip if already initialized
  if (initialized) {
    return
  }

  // Create initialization promise
  initializationPromise = performInitialization()

  try {
    await initializationPromise
  } finally {
    initializationPromise = null
  }
}

// Perform the actual initialization
async function performInitialization(): Promise<void> {
  try {
    console.log('🔧 Initializing email job processing...')

    // Check if running in a suitable environment
    if (!shouldInitializeJobs()) {
      console.log('⏭️ Skipping job initialization (unsuitable environment)')
      return
    }

    // Initialize the job manager
    await jobManager.initialize()
    initialized = true

    console.log('✅ Email job processing initialized successfully')

  } catch (error) {
    console.error('❌ Failed to initialize email jobs:', error)
    initialized = false
    throw error
  }
}

// Determine if jobs should be initialized in current environment
function shouldInitializeJobs(): boolean {
  // Skip in build process
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    return false
  }

  // Skip if explicitly disabled
  if (process.env.DISABLE_BACKGROUND_JOBS === 'true') {
    return false
  }

  // Skip in test environment
  if (process.env.NODE_ENV === 'test') {
    return false
  }

  // Check for required environment variables
  const requiredEnvVars = [
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️ Missing required environment variable: ${envVar}`)
      return false
    }
  }

  return true
}

// Force initialization (for manual triggers)
export async function forceInitializeJobs(): Promise<void> {
  initialized = false
  initializationPromise = null
  await initializeJobs()
}

// Check initialization status
export function isJobsInitialized(): boolean {
  return initialized
}

// Get job system status
export async function getJobsStatus(): Promise<any> {
  if (!initialized) {
    return {
      initialized: false,
      error: 'Jobs not initialized'
    }
  }

  return await jobManager.getStatus()
}

// Restart job system
export async function restartJobs(): Promise<void> {
  if (initialized) {
    await jobManager.restart()
  } else {
    await initializeJobs()
  }
}

// Graceful shutdown
export async function shutdownJobs(): Promise<void> {
  if (initialized) {
    await jobManager.shutdown()
    initialized = false
  }
}