import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.NEXT_PUBLIC_RESTAURANT_ID = 'rest_demo_001'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
