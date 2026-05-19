"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * React Query client instance
 * Manages async state and caching
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
    },
  },
});

/**
 * React Query provider wrapper
 * Provides QueryClient to the entire app
 */
export function QueryProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
