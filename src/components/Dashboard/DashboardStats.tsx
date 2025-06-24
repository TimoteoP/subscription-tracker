"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { calculateMonthlyCost, getExpiringSoon, getCategoryBreakdown } from '@/lib/calculations';
import { fetchSubscriptions, fetchCategories } from '@/lib/supabase/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, AlertCircle, PieChart, Loader2 } from 'lucide-react';
import type { Subscription, Category } from '@/types';

export default function DashboardStats() {
  const { user, isLoading: userLoading } = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
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

  // Show loading state
  if (userLoading || isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Error loading dashboard: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User not logged in
  if (!user) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Please log in to view your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter subscriptions for current user
  const userSubscriptions = subscriptions.filter(sub => sub.user_id === user.id);
  const activeSubs = userSubscriptions.filter(sub => sub.status === 'active');

  // Calculate statistics
  const monthlyCost = calculateMonthlyCost(activeSubs);
  const expiringSoon = getExpiringSoon(activeSubs, 30);
  const categoryBreakdown = getCategoryBreakdown(activeSubs);

  // Map categories for names
  const categoryMap = categories.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {} as Record<string, string>);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Card: Active subscriptions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSubs.length}</div>
          <p className="text-xs text-muted-foreground">
            {userSubscriptions.length - activeSubs.length} inactive
          </p>
        </CardContent>
      </Card>

      {/* Card: Monthly cost */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${monthlyCost.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on active subscriptions
          </p>
        </CardContent>
      </Card>

      {/* Card: Yearly cost */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Yearly Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(monthlyCost * 12).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Projected annual cost
          </p>
        </CardContent>
      </Card>

      {/* Card: Expiring soon */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{expiringSoon.length}</div>
          <p className="text-xs text-muted-foreground">
            Next 30 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}