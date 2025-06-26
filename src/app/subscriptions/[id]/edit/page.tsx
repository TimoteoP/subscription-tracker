"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SubscriptionForm from '@/components/Subscription/SubscriptionForm';
import { useUser } from '@/context/UserContext';
import { fetchSubscriptionById, updateSubscription } from '@/lib/supabase/db';
import type { Subscription } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditSubscriptionPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const getSubscription = async () => {
      try {
        const data = await fetchSubscriptionById(id);
        if (data.user_id !== user?.id) {
          setError("You don't have permission to edit this subscription.");
          return;
        }
        setSubscription(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch subscription.");
      } finally {
        setLoading(false);
      }
    };
    if (user) {
        getSubscription();
    }
  }, [id, user]);

  const handleSubmit = async (values: any) => {
    // 💡 LA CORREZIONE È QUI
    if (!id) {
        setError("Cannot update: Subscription ID is missing.");
        return; // Interrompi la funzione se l'ID non è presente
      }
      // A questo punto, TypeScript sa che 'id' non può essere undefined
    setLoading(true);
    setError(null);
    try {
      await updateSubscription(id, values);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update subscription");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
     return (
      <Card className="max-w-lg mx-auto mt-12">
        <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <p>{error}</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">Go to Dashboard</Button>
        </CardContent>
      </Card>
     )
  }

  return (
    <Card className="max-w-xl mx-auto mt-12">
      <CardHeader>
        <CardTitle>Edit Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        {subscription && (
          <SubscriptionForm
            subscription={subscription}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/dashboard')}
          />
        )}
      </CardContent>
    </Card>
  );
}