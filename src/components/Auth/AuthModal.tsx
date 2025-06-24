"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  /* ──────────────────────────────────────────────────────────────
     1️⃣  Crea il client Supabase **solo se window esiste**        */
  const [supabase] = useState(() =>
    typeof window !== "undefined"
      ? createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
      : null
  );

  /* 2️⃣  Stato locale per eventuali sessioni / form step          */
  const [session, setSession] = useState<Session | null>(null);

  /* 3️⃣  Quando la modale si apre, ascolta auth-state             */
  useEffect(() => {
    if (!supabase || !isOpen) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        setSession(newSession);
        onClose();               // chiudi la modale al login
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, isOpen, onClose]);

  if (!isOpen) return null;           // la modale è chiusa

  /* 4️⃣  Se `supabase` è ancora null (SSR) non renderizzi nulla   */
  if (!supabase) return null;

  /* 5️⃣  Render del contenuto (es. email+password)                */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* semplice placeholder UI; sostituisci con il tuo form */}
      <div className="w-full max-w-md rounded bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Log in / Sign up</h2>

        {/* form di esempio: una sola email per magic-link */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const email = (e.currentTarget.elements.namedItem(
              "email"
            ) as HTMLInputElement).value;
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) alert(error.message);
            else alert("Check your mail for the magic link!");
          }}
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full rounded border px-3 py-2"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-white"
          >
            Send link
          </button>
        </form>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded border border-gray-300 px-4 py-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
