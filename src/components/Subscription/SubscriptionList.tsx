import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchSubscriptions, fetchCategories } from '@/lib/supabase/db';
import { differenceInDays, format } from 'date-fns';
import type { Subscription } from '@/types';

interface SubscriptionListProps {
  userId: string;
}

export default async function SubscriptionList({ userId }: SubscriptionListProps) {
  const [subscriptions, categories] = await Promise.all([
    fetchSubscriptions(),
    fetchCategories(),
  ]);

  const categoryMap = categories.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {} as Record<string, string>);

  const getStatusColor = (subscription: Subscription) => {
    const daysLeft = differenceInDays(new Date(subscription.end_date), new Date());
    
    if (subscription.status === 'canceled') return 'bg-gray-100';
    if (daysLeft <= 7) return 'bg-red-50';
    if (daysLeft <= 30) return 'bg-yellow-50';
    return '';
  };

  return (
    <div className="rounded-md border">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Your Subscriptions</h2>
        <Link href="/subscriptions/new">
          <Button>Add Subscription</Button>
        </Link>
      </div>
      
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
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id} className={getStatusColor(subscription)}>
              <TableCell className="font-medium">{subscription.name}</TableCell>
              <TableCell>{categoryMap[subscription.category_id]}</TableCell>
              <TableCell>
                ${subscription.cost.toFixed(2)} {subscription.billing_cycle}
              </TableCell>
              <TableCell>{format(new Date(subscription.start_date), 'MMM d, yyyy')}</TableCell>
              <TableCell>{format(new Date(subscription.end_date), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                {differenceInDays(new Date(subscription.end_date), new Date())}
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
              <TableCell>
                <Link href={`/subscriptions/${subscription.id}/edit`}>
                  <Button variant="ghost" size="sm">Edit</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}