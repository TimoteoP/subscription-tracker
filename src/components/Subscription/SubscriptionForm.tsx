import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, addMonths, addYears } from 'date-fns';
import { fetchCategories, fetchCurrencies } from '@/lib/supabase/db';
import type { Subscription, Category, Currency } from '@/types';

// Define validation schema
const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  start_date: z.string().min(1, 'Start date is required'),
  duration: z.enum(['7d', '30d', '45d', '60d', '90d', '6m', '1y', '2y', '3y', '4y', '5y']),
  billing_cycle: z.enum(['monthly', 'quarterly', 'annual', 'biennial', 'triennial', 'one-time']),
  cost: z.number().min(0, 'Cost must be positive'),
  currency_id: z.string().min(1, 'Currency is required'),
  recurring: z.boolean().default(true),
  reminder_days: z.number().min(1).max(30).default(7),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormProps {
  subscription?: Subscription;
  onSubmit: (values: SubscriptionFormValues) => Promise<void>;
  onCancel: () => void;
}

export default function SubscriptionForm({ subscription, onSubmit, onCancel }: SubscriptionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: subscription?.name || '',
      description: subscription?.description || '',
      category_id: subscription?.category_id || '',
      start_date: subscription?.start_date || format(new Date(), 'yyyy-MM-dd'),
      duration: (subscription?.duration as any) || '1y',
      billing_cycle: (subscription?.billing_cycle as any) || 'monthly',
      cost: subscription?.cost || 0,
      currency_id: subscription?.currency_id || '',
      recurring: subscription?.recurring ?? true,
      reminder_days: subscription?.reminder_days || 7,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, curs] = await Promise.all([
          fetchCategories(),
          fetchCurrencies(),
        ]);
        setCategories(cats);
        setCurrencies(curs);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };
    loadData();
  }, []);

  const calculateEndDate = (startDate: string, duration: string) => {
    const date = new Date(startDate);
    switch (duration) {
      case '7d': return format(addDays(date, 7), 'yyyy-MM-dd');
      case '30d': return format(addDays(date, 30), 'yyyy-MM-dd');
      case '45d': return format(addDays(date, 45), 'yyyy-MM-dd');
      case '60d': return format(addDays(date, 60), 'yyyy-MM-dd');
      case '90d': return format(addDays(date, 90), 'yyyy-MM-dd');
      case '6m': return format(addMonths(date, 6), 'yyyy-MM-dd');
      case '1y': return format(addYears(date, 1), 'yyyy-MM-dd');
      case '2y': return format(addYears(date, 2), 'yyyy-MM-dd');
      case '3y': return format(addYears(date, 3), 'yyyy-MM-dd');
      case '4y': return format(addYears(date, 4), 'yyyy-MM-dd');
      case '5y': return format(addYears(date, 5), 'yyyy-MM-dd');
      default: return format(date, 'yyyy-MM-dd');
    }
  };

  const handleDurationChange = (duration: string) => {
    const startDate = form.getValues('start_date');
    if (startDate) {
      const endDate = calculateEndDate(startDate, duration);
      form.setValue('end_date', endDate);
    }
  };

  const handleStartDateChange = (date: string) => {
    const duration = form.getValues('duration');
    const endDate = calculateEndDate(date, duration);
    form.setValue('end_date', endDate);
  };

  const handleSubmit = async (values: SubscriptionFormValues) => {
    try {
      const endDate = calculateEndDate(values.start_date, values.duration);
      await onSubmit({ ...values, end_date: endDate });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (isLoading) return <div>Loading form data...</div>;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {/* Form fields with proper validation */}
      {/* Implement all form fields with Tailwind styling */}
      {/* Include error messages for validation */}
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {subscription ? 'Update' : 'Create'} Subscription
        </button>
      </div>
    </form>
  );
}