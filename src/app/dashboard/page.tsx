"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

import DashboardStats from "@/components/Dashboard/DashboardStats";
import SubscriptionList from "@/components/Subscription/SubscriptionList";
import { useUser } from "@/context/UserContext";

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  /* ---------------------------------------------------------------
     Se non c'è utente dopo che il loading è terminato, 
     redireziona lato client evitando crash.
  -----------------------------------------------------------------*/
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth");   // replace = niente “Back” per tornare qui
    }
  }, [isLoading, user, router]);

  /* Durante il redirect non mostriamo nulla */
  if (!isLoading && !user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Subscriptions</h1>

      <Suspense fallback={<div>Loading dashboard...</div>}>
        {user && (
          <>
            <DashboardStats userId={user.id} />
            <div className="mt-12">
              <SubscriptionList userId={user.id} />
            </div>
          </>
        )}
      </Suspense>
    </div>
  );
}
