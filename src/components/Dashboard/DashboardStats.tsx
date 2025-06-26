"use client";

import { calculateMonthlyCost, getExpiringSoon } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, AlertCircle, PieChart, Users } from 'lucide-react';
import type { Subscription } from '@/types';

// Accetta 'subscriptions' come prop
interface DashboardStatsProps {
  subscriptions: Subscription[];
}

export default function DashboardStats({ subscriptions }: DashboardStatsProps) {
  const activeSubs = subscriptions.filter(sub => sub.status === 'active');
  const monthlyCost = calculateMonthlyCost(activeSubs);
  const expiringSoon = getExpiringSoon(activeSubs, 30);
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSubs.length}</div>
          <p className="text-xs text-muted-foreground">
            out of {subscriptions.length} total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${monthlyCost.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Based on active subs</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Yearly Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(monthlyCost * 12).toFixed(2)}</div>
           <p className="text-xs text-muted-foreground">Projected from monthly</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{expiringSoon.length}</div>
          <p className="text-xs text-muted-foreground">in the next 30 days</p>
        </CardContent>
      </Card>
    </div>
  );
}