"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Loader2, Plus, MessageSquare } from 'lucide-react';
import { deleteSubscription } from '@/lib/supabase/db';
import { differenceInDays, format } from 'date-fns';
import type { Subscription, Category } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Importa Tooltip

// Accetta 'subscriptions' e 'categories' come props
interface SubscriptionListProps {
  subscriptions: Subscription[];
  categories: Category[];
}

export default function SubscriptionList({ subscriptions, categories }: SubscriptionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    setDeletingId(id);
    try {
      await deleteSubscription(id);
      // Non è più necessario aggiornare lo state qui, la pagina parente lo farà.
      // Per una UX migliore, potremmo voler ricaricare la pagina.
      window.location.reload();
    } catch (err) {
      alert('Failed to delete subscription.');
    } finally {
      setDeletingId(null);
    }
  };

  const categoryMap = categories.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {} as Record<string, string>);

  const getStatusStyle = (status: string, endDateStr: string | null) => {
    if (status !== 'active') return 'opacity-60';
    if (!endDateStr) return '';
    const daysLeft = differenceInDays(new Date(endDateStr), new Date());
    if (daysLeft <= 7) return 'bg-red-50';
    if (daysLeft <= 30) return 'bg-yellow-50';
    return '';
  };

  return (
    <div className="rounded-md border">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Your Subscriptions</h2>
        <Link href="/subscriptions/new"><Button><Plus className="mr-2 h-4 w-4" />Add Subscription</Button></Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Days Left</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length > 0 ? subscriptions.map((sub) => (
            <TableRow key={sub.id} className={getStatusStyle(sub.status ?? 'inactive', sub.end_date ?? null)}>
              <TableCell className="font-medium flex items-center gap-2">
                {sub.name}
                {/* ICONA PER LE NOTE */}
                {sub.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <MessageSquare className="h-4 w-4 text-blue-500 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{sub.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </TableCell>
              <TableCell>{categoryMap[sub.category_id] || 'N/A'}</TableCell>
              <TableCell>${sub.cost.toFixed(2)} <span className="text-xs text-muted-foreground">/{sub.billing_cycle}</span></TableCell>
              <TableCell>{sub.end_date ? format(new Date(sub.end_date), 'MMM d, yyyy') : 'N/A'}</TableCell>
              <TableCell>{sub.end_date ? Math.max(0, differenceInDays(new Date(sub.end_date), new Date())) : '∞'}</TableCell>
              <TableCell className="flex space-x-2">
                <Link href={`/subscriptions/${sub.id}/edit`}><Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button></Link>
      <Button 
        variant="outline" // Usiamo la variante 'outline' che esiste
        size="sm" 
        className="text-red-500 hover:text-red-600 hover:bg-red-50" // Aggiungiamo classi per il colore rosso
        onClick={() => handleDelete(sub.id)} 
        disabled={deletingId === sub.id}
    >
      {deletingId === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">No subscriptions found for the selected category.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}