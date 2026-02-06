"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/authStore";
import { getCurrentUser, getSession } from "@/lib/supabase/auth";

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const { setUser, setLoading, logout } = useAuthStore();
// 
//   useEffect(() => {
//     // Sayfa yüklendiğinde kullanıcıyı kontrol et
//     checkUser();
// 
//     // Auth değişikliklerini dinle (login/logout)
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
//       if (event === "SIGNED_IN" && session) {
//         // Giriş yapıldı
//         const user = await getCurrentUser();
//         setUser(user);
//       } else if (event === "SIGNED_OUT") {
//         // Çıkış yapıldı
//         logout();
//       }
//     });
// 
//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [setUser, setLoading, logout]);
// 
//   async function checkUser() {
//     try {
//       // Check session
//       const session = await getSession();
//       if (!session) {
//         setUser(null);
//         return;
//       }
// 
//       const user = await getCurrentUser();
//       setUser(user);
//     } catch (error) {
//       console.error("Auth check error:", error);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }
// 
//   return <>{children}</>;
// }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, logout } = useAuthStore();
  const isInitialMount = useRef(true);

  useEffect(() => {
    // 1. İlk yüklemede session kontrolü
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Initial auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. Auth değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Async callback yerine senkron yönetimi tercih et
      if (session) {
        setUser(session.user);
      } else {
        logout();
      }
      
      // Initial mount sonrası loading'i kapat
      if (isInitialMount.current) {
        setLoading(false);
        isInitialMount.current = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, logout]);

  return <>{children}</>;
}