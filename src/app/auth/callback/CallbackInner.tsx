"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr"; // o importa il tuo client già configurato

export default function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      router.replace("/auth?error=missing_code");
      return;
    }
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
      if (error) {
        router.replace("/auth?error=invalid_code");
      } else {
        router.replace("/dashboard");
      }
    });
  }, [router, searchParams]);

  return <p className="p-6 text-center">Accesso in corso...</p>;
}
