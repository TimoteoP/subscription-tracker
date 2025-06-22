import { calculateMonthlyCost, getExpiringSoon, getCategoryBreakdown } from '@/lib/calculations';
import { fetchSubscriptions, fetchCategories } from '@/lib/supabase/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, AlertCircle, PieChart } from 'lucide-react';

interface DashboardStatsProps {
  userId: string;
}

export default async function DashboardStats({ userId }: DashboardStatsProps) {
  // Fetch dati in parallelo
  const [subscriptions, categories] = await Promise.all([
    fetchSubscriptions(),
    fetchCategories(),
  ]);

  // Filtra solo le subscription dell'utente corrente
  const userSubscriptions = subscriptions.filter(sub => sub.user_id === userId);
  const activeSubs = userSubscriptions.filter(sub => sub.status === 'active');

  // Calcoli statistiche
  const monthlyCost = calculateMonthlyCost(activeSubs);
  const expiringSoon = getExpiringSoon(activeSubs, 30);
  const categoryBreakdown = getCategoryBreakdown(activeSubs);

  // Mappa categorie per nome
  const categoryMap = categories.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {} as Record<string, string>);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Carta: Abbonamenti attivi */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSubs.length}</div>
        </CardContent>
      </Card>

      {/* Carta: Costo mensile */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${monthlyCost.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      {/* Carta: Costo annuale */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Yearly Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(monthlyCost * 12).toFixed(2)}
          </div>
        </CardContent>
      </Card>

      {/* Carta: In scadenza */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{expiringSoon.length}</div>
        </CardContent>
      </Card>
    </div>
  );
}