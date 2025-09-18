import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Setup environment variables for testing
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test'
}
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder
global.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder

// Mock window.matchMedia (for mobile responsive tests)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn()
  disconnect = jest.fn()
  unobserve = jest.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock WebSocket for real-time tests
global.WebSocket = class MockWebSocket {
  readyState = WebSocket.OPEN
  
  constructor(public url: string) {}
  
  send = jest.fn()
  close = jest.fn()
  
  // Event handlers
  onopen?: ((event: Event) => void) | null = null
  onclose?: ((event: CloseEvent) => void) | null = null
  onmessage?: ((event: MessageEvent) => void) | null = null
  onerror?: ((event: Event) => void) | null = null
  
  // Event listener methods
  addEventListener = jest.fn()
  removeEventListener = jest.fn()
  dispatchEvent = jest.fn()
  
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
} as unknown as typeof WebSocket

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src as string} alt={alt as string} {...props} />
  },
}))

// Mock framer-motion for testing performance
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: Record<string, unknown>) => <span {...props}>{children}</span>,
    p: ({ children, ...props }: Record<string, unknown>) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: Record<string, unknown>) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: Record<string, unknown>) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: Record<string, unknown>) => <h3 {...props}>{children}</h3>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
}))

// Console spy setup for better test output
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
  
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillUpdate'))
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})