import { supabase } from './client';
import type { Subscription, Category } from '@/types';

// ✅ NEW VERSION - automatically filtered by RLS based on current user
export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('end_date', { ascending: true });

  if (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }

  return data || [];
};

// If you want to be extra explicit about user filtering (though RLS should handle this):
export const fetchUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('end_date', { ascending: true });

  if (error) {
    console.error('Error fetching user subscriptions:', error);
    throw error;
  }

  return data || [];
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

  if (!data) {
    throw new Error('Subscription not found');
  }

  return data;
};

// ✅ NUOVA VERSIONE di createSubscription
export const createSubscription = async (
  subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
): Promise<Subscription> => {
  if (!subscription.user_id) {
    throw new Error('User not authenticated');
  }

  // Costruiamo l'oggetto da inserire, assicurandoci che tutti i campi ci siano
  const newSubscriptionData = {
    ...subscription,
    status: 'active', // Impostiamo sempre come attivo all'inizio
    // Questi campi potrebbero non arrivare più dal form, quindi diamo dei default
    duration: subscription.duration || '1y', 
    recurring: subscription.recurring !== undefined ? subscription.recurring : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('subscriptions')
    .insert(newSubscriptionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating subscription in DB:', error); // Log più dettagliato
    throw error;
  }

  if (!data) {
    throw new Error('Failed to create subscription, no data returned.');
  }

  return data;
};

// ✅ NUOVA VERSIONE di updateSubscription
export const updateSubscription = async (
  id: string, 
  updates: Partial<Omit<Subscription, 'id' | 'created_at' | 'user_id'>>
): Promise<Subscription> => {
  
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating subscription in DB:', error); // Log più dettagliato
    throw error;
  }

  if (!data) {
    throw new Error('Subscription not found for update');
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

  if (!data) {
    throw new Error('Subscription not found');
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

  return data || [];
};