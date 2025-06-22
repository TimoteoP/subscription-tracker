"use client";

import { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase/client';
import Modal from './Modal';
import type { Session } from '@supabase/supabase-js'; // Aggiungi questo import

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [_, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) onClose();
    });

    return () => subscription.unsubscribe();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
          redirectTo={`${window.location.origin}/auth/callback`}
        />
      </div>
    </Modal>
  );
}