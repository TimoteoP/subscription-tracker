// src/app/dashboard/page.tsx
import DashboardStats from '@/components/Dashboard/DashboardStats';
import SubscriptionList from '@/components/Subscription/SubscriptionList';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DashboardStats />
      <SubscriptionList />
    </div>
  );
}
