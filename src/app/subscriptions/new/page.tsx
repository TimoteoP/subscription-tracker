"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SubscriptionForm from "@/components/Subscription/SubscriptionForm";
import { useUser } from "@/context/UserContext";
import { createSubscription } from "@/lib/supabase/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

export default function NewSubscriptionPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-lg mx-auto mt-12">
        <CardHeader>
          <CardTitle>Log in required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">
            Please log in to add a subscription.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      await createSubscription({ ...values, user_id: user.id });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-12">
      <CardHeader>
        <CardTitle>Add New Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 text-red-600 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        <SubscriptionForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard")}
        />
        {loading && (
          <div className="mt-6 text-center">
            <Loader2 className="animate-spin h-6 w-6 inline text-muted-foreground" />
            <span className="ml-2">Saving...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
