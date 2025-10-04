'use client'

import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return <TanStackQueryClientProvider client={queryClient}>{children}</TanStackQueryClientProvider>
}
