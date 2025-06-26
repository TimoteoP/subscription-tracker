"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { fetchSubscriptions, fetchCategories } from '@/lib/supabase/db';
import type { Subscription, Category } from '@/types';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import SubscriptionList from '@/components/Subscription/SubscriptionList';
import { Loader2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardPage() {
  const { user, isLoading: userLoading } = useUser();
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // STATO PER IL FILTRO
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const [subsData, catsData] = await Promise.all([
          fetchSubscriptions(),
          fetchCategories(),
        ]);
        setAllSubscriptions(subsData);
        setCategories(catsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (!userLoading && user) {
      loadData();
    } else if (!userLoading && !user) {
      setIsLoading(false); // Non c'è utente, smetti di caricare
    }
  }, [user, userLoading]);

  // Filtra gli abbonamenti in base alla categoria selezionata
  const filteredSubscriptions = selectedCategoryId === 'all'
    ? allSubscriptions
    : allSubscriptions.filter(sub => sub.category_id === selectedCategoryId);

  if (isLoading || userLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-red-600 p-4 border border-red-200 bg-red-50 rounded-md"><AlertCircle className="inline mr-2" />{error}</div>;
  }

  if (!user) {
    return <div className="text-center text-gray-500 mt-8">Please log in to view your dashboard.</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* SELETTORE PER IL FILTRO */}
      <div className="flex justify-end items-center">
        <div className="flex items-center gap-2">
            <label htmlFor="category-filter" className="text-sm font-medium">Filter by Category:</label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="w-[180px]" id="category-filter">
                    <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {/* Passa gli abbonamenti filtrati ai componenti figli */}
      <DashboardStats subscriptions={filteredSubscriptions} />
      <SubscriptionList subscriptions={filteredSubscriptions} categories={categories} />
    </div>
  );
}
