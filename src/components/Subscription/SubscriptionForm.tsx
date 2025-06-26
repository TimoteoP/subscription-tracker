"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { format, add, setDate, isAfter, startOfDay } from "date-fns";
import { fetchCategories } from "@/lib/supabase/db";
import type { Subscription, Category } from "@/types";
import { Loader2 } from "lucide-react";

/* ---------------- ZOD SCHEMA ---------------- */
const subscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  first_payment_date: z.string().min(1, "First payment date is required"),
  billing_cycle: z.enum([
    "monthly", "quarterly", "annual",
    "biennial", "triennial", "one-time",
  ]),
  cost: z.preprocess(
    (v) => (v === "" || v === null ? undefined : Number(v)),
    z.number({ required_error: "Cost is required" }).min(0.01, "Cost must be a positive number")
  ),
  reminder_days: z.preprocess(
    (v) => Number(v),
    z.number().min(1).max(30).default(7)
  ),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type FormValues = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormProps {
  subscription?: Partial<Subscription>;
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
}

// ... altri import ...

// ✅ FUNZIONE DI CALCOLO CORRETTA E TYPESAFE
const calculateNextBillingCycle = (firstDateStr: string, cycle: FormValues["billing_cycle"]): { startDate: string, endDate: string } => {
  if (!firstDateStr || !cycle) return { startDate: "", endDate: "" };
  
  try {
      const firstDate = new Date(firstDateStr);
      if (isNaN(firstDate.getTime())) return { startDate: "", endDate: "" };

      if (cycle === 'one-time') {
          const formattedDate = format(firstDate, "yyyy-MM-dd");
          return { startDate: formattedDate, endDate: formattedDate };
      }
      
      const today = startOfDay(new Date());
      let nextBillingDate = setDate(new Date(today), firstDate.getDate());

      const getCycleDuration = (): { months?: number, years?: number } => {
          switch(cycle) {
              case 'monthly': return { months: 1 };
              case 'quarterly': return { months: 3 };
              case 'annual': return { years: 1 };
              case 'biennial': return { years: 2 };
              case 'triennial': return { years: 3 };
              default: return {};
          }
      }
      
      // 💡 LA CORREZIONE È QUI
      const cycleDuration = getCycleDuration();

      if (isAfter(today, nextBillingDate)) {
          nextBillingDate = add(nextBillingDate, cycleDuration);
      }

      const cycleStartDate = add(nextBillingDate, {
          months: -(cycleDuration.months || 0), // Usa il valore di default 0 se months è undefined
          years: -(cycleDuration.years || 0)   // Usa il valore di default 0 se years è undefined
      });
      
      return {
          startDate: format(cycleStartDate, "yyyy-MM-dd"),
          endDate: format(nextBillingDate, "yyyy-MM-dd")
      };
  } catch {
      return { startDate: "", endDate: "" };
  }
};

export default function SubscriptionForm({
  subscription,
  onSubmit,
  onCancel,
}: SubscriptionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: subscription?.name ?? "",
      description: subscription?.description ?? "",
      category_id: subscription?.category_id ?? "",
      first_payment_date: subscription?.start_date
        ? format(new Date(subscription.start_date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      billing_cycle: (subscription?.billing_cycle as FormValues["billing_cycle"]) ?? "monthly",
      cost: subscription?.cost ?? undefined,
      reminder_days: subscription?.reminder_days ?? 7,
    },
  });

  const firstPaymentDate = watch("first_payment_date");
  const billingCycle = watch("billing_cycle");
  
  const { startDate: calculatedStartDate, endDate: calculatedEndDate } = calculateNextBillingCycle(firstPaymentDate, billingCycle);

  useEffect(() => {
    (async () => {
      setIsLoadingLookups(true);
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (e) {
        console.error("Lookup load error:", e);
      } finally {
        setIsLoadingLookups(false);
      }
    })();
  }, []);

  const onSubmitHandler: SubmitHandler<FormValues> = async (data) => {
    const { endDate } = calculateNextBillingCycle(data.first_payment_date, data.billing_cycle);
    
    const submissionData = {
      ...data,
      start_date: data.first_payment_date, 
      end_date: endDate,
      status: 'active',
      duration: '1y',
      recurring: data.billing_cycle !== 'one-time',
    };

    delete (submissionData as any).first_payment_date;
    await onSubmit(submissionData);
  };

  if (isLoadingLookups) return <div>Loading form data…</div>;

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4 max-w-xl">
        <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Nome Abbonamento</label>
            <input id="name" type="text" {...register("name")} className="w-full rounded-md border px-3 py-2" disabled={isSubmitting} />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Descrizione (opzionale)</label>
            <textarea id="description" {...register("description")} className="w-full rounded-md border px-3 py-2" rows={3} disabled={isSubmitting} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="cost" className="block text-sm font-medium mb-1">Costo</label>
                <input id="cost" type="number" step="0.01" {...register("cost")} className="w-full rounded-md border px-3 py-2" disabled={isSubmitting} />
                {errors.cost && <p className="text-red-600 text-sm mt-1">{errors.cost.message}</p>}
            </div>
            <div>
                <label htmlFor="category_id" className="block text-sm font-medium mb-1">Categoria</label>
                <select id="category_id" {...register("category_id")} className="w-full rounded-md border px-3 py-2" disabled={isSubmitting}>
                    <option value="">Seleziona categoria</option>
                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
                {errors.category_id && <p className="text-red-600 text-sm mt-1">{errors.category_id.message}</p>}
            </div>
        </div>
        <hr className="my-2"/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="first_payment_date" className="block text-sm font-medium mb-1">Data Primo Pagamento</label>
                <input id="first_payment_date" type="date" {...register("first_payment_date")} className="w-full rounded-md border px-3 py-2" disabled={isSubmitting} />
                <p className="text-xs text-gray-500 mt-1">La data del tuo primo pagamento in assoluto.</p>
                {errors.first_payment_date && <p className="text-red-600 text-sm mt-1">{errors.first_payment_date.message}</p>}
            </div>
            <div>
                <label htmlFor="billing_cycle" className="block text-sm font-medium mb-1">Ciclo di Fatturazione</label>
                <select id="billing_cycle" {...register("billing_cycle")} className="w-full rounded-md border px-3 py-2" disabled={isSubmitting}>
                    <option value="monthly">Mensile</option>
                    <option value="quarterly">Trimestrale</option>
                    <option value="annual">Annuale</option>
                    <option value="biennial">Biennale</option>
                    <option value="triennial">Triennale</option>
                    <option value="one-time">Una tantum</option>
                </select>
                {errors.billing_cycle && <p className="text-red-600 text-sm mt-1">{errors.billing_cycle.message}</p>}
            </div>
        </div>
        <div>
            <label htmlFor="reminder_days" className="block text-sm font-medium mb-1">Giorni di Promemoria prima della Scadenza</label>
            <input id="reminder_days" type="number" min="1" max="30" {...register("reminder_days")} className="w-full rounded-md border px-3 py-2" disabled={isSubmitting} />
            {errors.reminder_days && <p className="text-red-600 text-sm mt-1">{errors.reminder_days.message}</p>}
        </div>
        <div className="p-3 bg-gray-50 rounded-md border space-y-2">
            <h4 className="font-medium text-sm text-gray-800">Prossimo Ciclo di Fatturazione Calcolato</h4>
            {calculatedStartDate && calculatedEndDate ? (
                <p className="text-sm text-gray-600">
                    L'abbonamento sarà considerato attivo dal <span className="font-semibold">{format(new Date(calculatedStartDate), 'd MMM yyyy')}</span> al <span className="font-semibold">{format(new Date(calculatedEndDate), 'd MMM yyyy')}</span>.
                </p>
            ) : <p className="text-sm text-gray-500">Inserisci i dati per calcolare il ciclo.</p>}
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">
                Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-400 flex items-center justify-center min-w-[150px]">
            {isSubmitting ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
                </>
            ) : subscription ? (
                "Update Subscription"
            ) : (
                "Create Subscription"
            )}
            </button>
      </div>
    </form>
  );
}