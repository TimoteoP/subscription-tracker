export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category_id: string;
  start_date: string;
  end_date?: string;
  duration: string;
  billing_cycle: string;
  cost: number;
  recurring: boolean;
  status?: 'active' | 'canceled' | 'expired';
  date_canceled?: string;
  reminder_days?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}