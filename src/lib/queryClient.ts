import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min — datos considerados frescos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
