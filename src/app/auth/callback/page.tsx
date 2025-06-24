"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    (async () => {
      try {
        // 1️⃣  Se l'SDK offre getSessionFromUrl (versioni ≥ 2.33)
        if ("getSessionFromUrl" in supabase.auth) {
          // @ts-expect-error -- metodo presente a runtime
          const { error } = await supabase.auth.getSessionFromUrl({
            storeSession: true,
          });
          if (error) throw error;
        }
        // 2️⃣  Altrimenti prova lo scambio PKCE / OAuth
        else if ("exchangeCodeForSession" in supabase.auth) {
          // @ts-expect-error -- metodo presente a runtime
          const { error } = await supabase.auth.exchangeCodeForSession();
          if (error) throw error;
        }
        // 3️⃣  Fallback manuale per magic-link (?access_token=…&refresh_token=…)
        else {
          const raw = window.location.hash.substring(1) || window.location.search.substring(1);
          const params = new URLSearchParams(raw);
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");

          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          } else {
            throw new Error("No tokens found in callback URL");
          }
        }
      } catch (err) {
        console.error("Supabase auth callback error:", err);
      } finally {
        // In ogni caso porta l’utente alla dashboard
        router.replace("/dashboard");
      }
    })();
  }, [router]);

  return <p className="p-6 text-center">Logging you in…</p>;
}


