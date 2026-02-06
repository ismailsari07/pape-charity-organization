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
        // ✅ Tab gizlendiğinde: Tüm in-flight request'leri iptal et
        console.log("👁️ Tab hidden - cancelling queries");
        queryClient.cancelQueries(); // Tüm aktif query'leri iptal et
      } else {
        // ✅ Tab visible olduğunda: Sadece stale query'leri refetch et
        console.log("👁️ Tab visible - refetching stale queries");

        if (isMounted) {
          // 300ms bekle (browser throttle'dan kurtul)
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
      console.log("🌐 Back online - refetching");
      if (isMounted && !document.hidden) {
        queryClient.refetchQueries({ type: "active" });
      }
    };

    const handleOffline = () => {
      console.log("🌐 Gone offline");
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
