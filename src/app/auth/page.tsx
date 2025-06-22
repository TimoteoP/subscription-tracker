"use client";

import { useState } from "react";
import AuthModal from "@/components/Auth/AuthModal";   // path minuscolo!

export default function AuthPage() {
  // la modale parte aperta; quando l’utente chiude, la nascondiamo
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
