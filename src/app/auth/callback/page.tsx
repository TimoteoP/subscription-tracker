"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr"; // o il tuo client Supabase se già configurato

export default function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      // Nessun codice trovato nell'URL, reindirizza o mostra errore
      router.replace("/auth?error=missing_code");
      return;
    }
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    // Nuovo flusso Supabase-js v2+
    supabase.auth.exchangeCodeForSession(code)
      .then(({ data, error }) => {
        if (error) {
          router.replace("/auth?error=invalid_code");
        } else {
          // Successo: redirect alla dashboard o dove preferisci
          router.replace("/dashboard");
        }
      });
  }, [router, searchParams]);

  return (
    <p className="p-6 text-center">Accesso in corso...</p>
  );
}



