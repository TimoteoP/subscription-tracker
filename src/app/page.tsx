"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DollarSign, PieChart, Bell, Plus } from "lucide-react";

export default function LandingPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  // Mostra landing solo se non loggato
  if (isLoading || user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold mb-4 text-blue-700 text-center">
          Subscription Tracker
        </h1>
        <p className="text-lg text-gray-700 mb-6 text-center">
          Gestisci e monitora tutti i tuoi abbonamenti in un unico posto.<br />
          Ricevi promemoria, statistiche e non dimenticare mai più una scadenza!
        </p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col items-center">
            <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm text-gray-600 text-center">
              Tutti i costi sotto controllo
            </span>
          </div>
          <div className="flex flex-col items-center">
            <PieChart className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm text-gray-600 text-center">
              Statistiche e report intuitivi
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Bell className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm text-gray-600 text-center">
              Promemoria scadenze via mail
            </span>
          </div>
        </div>
        <Link href="/auth">
          <Button size="lg" className="w-full">
            <Plus className="mr-2 h-5 w-5" />
            Inizia ora: è gratis!
          </Button>
        </Link>
        <div className="mt-6 text-center text-gray-400 text-xs">
          Nessun pagamento richiesto, solo gestione facile!
        </div>
      </div>
    </main>
  );
}


