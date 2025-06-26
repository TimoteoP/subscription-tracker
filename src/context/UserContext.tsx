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

type UserContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

// Valori di default
const UserContext = createContext<UserContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("UserProvider: useEffect sta partendo."); // <-- LOG 1
    // 1. Ottieni la sessione corrente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("UserProvider: getSession completato.", session); // <-- LOG 2
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 2. Ascolta i cambiamenti futuri (es. LOGOUT)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("UserProvider: onAuthStateChange ricevuto!", _event, session); // <-- LOG 3
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Pulisci il listener quando il componente viene smontato
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
  };
  console.log("UserProvider: Rendering con stato:", value); // <-- LOG 4
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Hook per usare il contesto
export const useUser = () => useContext(UserContext);