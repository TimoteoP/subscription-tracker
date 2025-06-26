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
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoading) {
      // Aspetta che l'utente sia caricato prima di fare qualsiasi cosa
      return;
    }

    if (!user) {
      // Se dopo il caricamento l'utente non c'è, mostra errore
      setError("Please log in to edit a subscription.");
      setPageLoading(false);
      return;
    }

    if (!id) {
      setError("Subscription ID is missing from the URL.");
      setPageLoading(false);
      return;
    }
    
    const getSubscription = async () => {
      try {
        const data = await fetchSubscriptionById(id);
        // Controllo di sicurezza: l'utente può modificare solo i suoi abbonamenti
        if (data.user_id !== user.id) {
          setError("You don't have permission to edit this subscription.");
          setSubscription(null); // Assicurati che non vengano mostrati dati altrui
        } else {
          setSubscription(data);
        }
      } catch (err) {
        console.error("Failed to fetch subscription:", err);
        setError(err instanceof Error ? err.message : "Could not find the subscription.");
      } finally {
        setPageLoading(false);
      }
    };
    
    getSubscription();
    
  }, [id, user, isUserLoading]);

  const handleSubmit = async (values: any) => {
    if (!id) {
      setError("Error: Subscription ID is missing. Cannot update.");
      return;
    }
    setError(null);

    try {
      await updateSubscription(id, values);
      // Reindirizza alla dashboard dopo il successo
      router.push('/dashboard');
    } catch (err) {
      console.error("Failed to update subscription:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while updating.");
    }
  };

  // Stato di caricamento iniziale della pagina
  if (pageLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading subscription data...</p>
      </div>
    );
  }
  
  // Stato di errore (ID mancante, permessi, etc.)
  if (error) {
     return (
      <Card className="max-w-lg mx-auto mt-12 border-red-200 bg-red-50">
        <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
                <AlertCircle className="h-6 w-6 mr-2" />
                An Error Occurred
            </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-red-800">
            <p className="mb-6">{error}</p>
            <Button variant="destructive" onClick={() => router.push('/dashboard')}>
                Return to Dashboard
            </Button>
        </CardContent>
      </Card>
     );
  }

  // Se tutto è andato bene, mostra il form
  return (
    <Card className="max-w-xl mx-auto mt-12">
      <CardHeader>
        <CardTitle>Edit Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <SubscriptionForm
            subscription={subscription}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/dashboard')}
          />
        ) : (
          // Fallback nel caso improbabile che la subscription sia null senza un errore
          <p>Could not load subscription data for editing.</p>
        )}
      </CardContent>
    </Card>
  );
}