"use client";
import { Suspense } from "react";
import CallbackInner from "./CallbackInner";

export default function CallbackPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center">Accesso in corso...</p>}>
      <CallbackInner />
    </Suspense>
  );
}



