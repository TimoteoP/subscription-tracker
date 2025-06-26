"use client";

import { useRouter } from "next/navigation";
import SubscriptionForm from "@/components/Subscription/SubscriptionForm";
import { useUser } from "@/context/UserContext";
import { createSubscription } from "@/lib/supabase/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function NewSubscriptionPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  // RIMOSSO lo stato 'loading'
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    // RIMOSSO setLoading(true)
    setError(null);
    if (!user) {
        setError("You must be logged in to create a subscription.");
        return;
    }
    try {
      await createSubscription({ ...values, user_id: user.id });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create subscription");
      // RIMOSSO setLoading(false)
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    // Gestione più robusta se l'utente non è loggato
    return (
      <Card className="max-w-lg mx-auto mt-12">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">
            Please log in to add a new subscription.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl mx-auto mt-12">
      <CardHeader>
        <CardTitle>Add New Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        <SubscriptionForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard")}
        />
        {/* RIMOSSA la sezione di loading manuale */}
      </CardContent>
    </Card>
  );
}
