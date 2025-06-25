"use client";
import { supabase } from '@/lib/supabase/client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/* Tipi                                                                */
/* ------------------------------------------------------------------ */
type UserContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */
export function UserProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* 2️⃣  One-shot: leggi la sessione se già esiste */
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // esegui solo al mount

  /* 3️⃣  Listener: aggiorna stato quando la sessione cambia */
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  /* 4️⃣  Funzione di logout */
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Hook di utilità                                                     */
/* ------------------------------------------------------------------ */
export const useUser = () => useContext(UserContext);