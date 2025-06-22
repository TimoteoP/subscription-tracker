import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
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

  // Filtra solo le subscription dell'utente corrente
  const userSubscriptions = subscriptions.filter(sub => sub.user_id === userId);

  // Crea mappa categorie per nome
  const categoryMap = categories.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {} as Record<string, string>);

  // Funzione per il colore dello stato
  const getStatusStyle = (subscription: Subscription) => {
    const endDate = subscription.end_date ?? subscription.start_date; // fallback se manca
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
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
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
              {/* start date: è sempre presente */}
          <TableCell>
            {format(new Date(subscription.start_date), 'MMM d, yyyy')}
          </TableCell>

          {/* end date: se undefined uso lo stesso start_date come fallback */}
          <TableCell>
            {format(
              new Date(subscription.end_date ?? subscription.start_date),
              'MMM d, yyyy'
            )}
          </TableCell>

          {/* days left: calcolo su endDate fissato, mai negativo */}
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
                <Button variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {userSubscriptions.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No subscriptions found. Add your first subscription to get started.
        </div>
      )}
    </div>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}