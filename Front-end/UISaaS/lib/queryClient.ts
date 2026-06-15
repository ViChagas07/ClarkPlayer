import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,          // 10 min — data stays "fresh" longer
      gcTime: 48 * 60 * 60 * 1000,         // 48 hours — cache survives full day
      retry: 2,
      refetchOnWindowFocus: false,          // no refetch on tab switch
      refetchOnMount: false,                // use cache on mount, don't refetch
      refetchOnReconnect: false,            // don't refetch on reconnect
    },
  },
})
