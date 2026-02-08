"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          gcTime: 5 * 60 * 1000, // garbage collection time (eski adı: cacheTime)
          refetchOnWindowFocus: false, // ✅ Manuel kontrol edeceğiz
          refetchOnReconnect: true,
          refetchOnMount: true,
          retry: 2,
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          networkMode: "online",
        },
        mutations: {
          retry: 1,
          networkMode: "online",
        },
      },
    });

    return client;
  });

  useEffect(() => {
    let isMounted = true;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        queryClient.cancelQueries();
      } else {
        if (isMounted) {
          setTimeout(() => {
            if (isMounted) {
              queryClient.invalidateQueries({
                refetchType: "active",
                predicate: (query) => query.isStale(),
              });
            }
          }, 300);
        }
      }
    };

    // Online/Offline event handling
    const handleOnline = () => {
      if (isMounted && !document.hidden) {
        queryClient.refetchQueries({ type: "active" });
      }
    };

    const handleOffline = () => {
      queryClient.cancelQueries();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
