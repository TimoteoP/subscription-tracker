import { supabase } from './client';
import type { Subscription, Category, Currency } from '@/types';

export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('end_date', { ascending: true });

  if (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }

  return data;
};

export const fetchSubscriptionById = async (id: string): Promise<Subscription> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }

  return data;
};

export const createSubscription = async (subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subscription)
    .select()
    .single();

  if (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }

  return data;
};

export const updateSubscription = async (id: string, updates: Partial<Subscription>): Promise<Subscription> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  return data;
};

export const cancelSubscription = async (id: string): Promise<Subscription> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ 
      status: 'canceled',
      date_canceled: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }

  return data;
};

export const deleteSubscription = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data;
};

export const fetchCurrencies = async (): Promise<Currency[]> => {
  const { data, error } = await supabase
    .from('currencies')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching currencies:', error);
    throw error;
  }

  return data;
};