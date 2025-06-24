"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Loader2, Plus } from 'lucide-react';
import { fetchSubscriptions, fetchCategories, deleteSubscription } from '@/lib/supabase/db';
import { differenceInDays, format } from 'date-fns';
import type { Subscription, Category } from '@/types';

export default function SubscriptionList() {
  const { user, isLoading: userLoading } = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const [subsData, catsData] = await Promise.all([
          fetchSubscriptions(),
          fetchCategories(),
        ]);
        
        setSubscriptions(subsData);
        setCategories(catsData);
      } catch (err) {
        console.error('Error loading subscriptions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
      } finally {
        setIsLoading(false);
      }
    };

    if (!userLoading && user) {
      loadData();
    } else if (!userLoading && !user) {
      setIsLoading(false);
    }
  }, [user, userLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    
    try {
      setDeletingId(id);
      await deleteSubscription(id);
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    } catch (err) {
      console.error('Error deleting subscription:', err);
      alert('Failed to delete subscription. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter subscriptions for current user
  const userSubscriptions = user 
    ? subscriptions.filter(sub => sub.user_id === user.id)
    : [];

  // Create category map for names
  const categoryMap = categories.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {} as Record<string, string>);

  // Function for status styling
  const getStatusStyle = (subscription: Subscription) => {
    const endDate = subscription.end_date ?? subscription.start_date;
    const daysLeft = differenceInDays(new Date(endDate), new Date());
    
    if (subscription.status === 'canceled') return 'bg-gray-50';
    if (daysLeft <= 7) return 'bg-red-50';
    if (daysLeft <= 30) return 'bg-yellow-50';
    return '';
  };

  return (
    <div className="rounded-md border">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Your Subscriptions</h2>
        <Link href="/subscriptions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
        </Link>
      </div>

      {/* Loading state */}
      {(userLoading || isLoading) && (
        <div className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading subscriptions...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-8 text-center text-red-600">
          <p>Error: {error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Not logged in */}
      {!user && !userLoading && !isLoading && (
        <div className="p-8 text-center text-gray-500">
          <p>Please log in to view your subscriptions.</p>
        </div>
      )}

      {/* Data loaded */}
      {!isLoading && !error && user && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userSubscriptions.map((subscription) => (
                <TableRow 
                  key={subscription.id} 
                  className={getStatusStyle(subscription)}
                >
                  <TableCell className="font-medium">{subscription.name}</TableCell>
                  <TableCell>{categoryMap[subscription.category_id] || 'Uncategorized'}</TableCell>
                  <TableCell>
                    ${subscription.cost.toFixed(2)} ({subscription.billing_cycle})
                  </TableCell>
                  <TableCell>
                    {format(new Date(subscription.start_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(subscription.end_date ?? subscription.start_date),
                      'MMM d, yyyy'
                    )}
                  </TableCell>
                  <TableCell>
                    {Math.max(
                      0,
                      differenceInDays(
                        new Date(subscription.end_date ?? subscription.start_date),
                        new Date()
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscription.status}
                    </span>
                  </TableCell>
                  <TableCell className="flex space-x-2">
                    <Link href={`/subscriptions/${subscription.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => handleDelete(subscription.id)}
                      disabled={deletingId === subscription.id}
                    >
                      {deletingId === subscription.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {userSubscriptions.length === 0 && (
  <div className="p-12 text-center text-gray-600 flex flex-col items-center">
    <img
      src="https://cdn.pixabay.com/photo/2017/01/31/17/44/notes-2029849_960_720.png"
      alt="Empty box"
      className="w-32 h-32 mx-auto mb-6 opacity-80"
      style={{ filter: "grayscale(30%)" }}
    />
    <h2 className="mb-2 text-2xl font-semibold">
      Benvenuto su Subscription Tracker!
    </h2>
    <p className="mb-6">
      Inizia subito aggiungendo il tuo primo abbonamento.<br />
      Tieni traccia delle spese ricorrenti, ricevi promemoria e controlla le tue statistiche in ogni momento.
    </p>
    <Link href="/subscriptions/new">
      <Button size="lg" className="mt-2">
        <Plus className="mr-2 h-5 w-5" />
        Aggiungi il tuo primo abbonamento
      </Button>
    </Link>
  </div>
)}
        </>
      )}
    </div>
  );
}