import { differenceInDays, format } from 'date-fns';
import type { Subscription } from '@/types';

export function calculateMonthlyCost(subscriptions: Subscription[]): number {
  return subscriptions.reduce((total, sub) => {
    if (sub.status !== 'active') return total;
    
    const amount = normalizeToMonthly(sub.cost, sub.billing_cycle);
    return total + amount;
  }, 0);
}

function normalizeToMonthly(amount: number, cycle: string): number {
  switch (cycle) {
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'annual': return amount / 12;
    case 'biennial': return amount / 24;
    case 'triennial': return amount / 36;
    case 'one-time': return 0;
    default: return 0;
  }
}

export function getExpiringSoon(subscriptions: Subscription[], daysThreshold: number): Subscription[] {
  const today = new Date();
  return subscriptions.filter(sub => {
    if (sub.status !== 'active') return false;
    
    const daysLeft = differenceInDays(new Date(sub.end_date), today);
    return daysLeft > 0 && daysLeft <= daysThreshold;
  });
}

export function getCategoryBreakdown(subscriptions: Subscription[]) {
  const breakdown: Record<string, { count: number; cost: number }> = {};

  subscriptions.forEach(sub => {
    if (!breakdown[sub.category_id]) {
      breakdown[sub.category_id] = { count: 0, cost: 0 };
    }
    
    breakdown[sub.category_id].count += 1;
    breakdown[sub.category_id].cost += normalizeToMonthly(sub.cost, sub.billing_cycle);
  });

  return breakdown;
}