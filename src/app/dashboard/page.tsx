import { Suspense } from 'react';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import SubscriptionList from '@/components/Subscription/SubscriptionList';
import { fetchSubscriptions } from '@/lib/supabase/db';
import { User } from '@supabase/supabase-js';
import { useUser } from '@/context/UserContext';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Subscriptions</h1>
      
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <DashboardStats userId={user?.id} />
      </Suspense>

      <div className="mt-12">
        <SubscriptionList userId={user?.id} />
      </div>
    </div>
  );
}