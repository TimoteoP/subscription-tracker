"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { format, addDays, addMonths, addYears } from "date-fns";

import { fetchCategories } from "@/lib/supabase/db";
import type { Subscription, Category } from "@/types";

/* ---------------- ZOD SCHEMA ---------------- */
const subscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  start_date: z.string().min(1, "Start date is required"),
  duration: z.enum([
    "7d", "30d", "45d", "60d", "90d",
    "6m", "1y", "2y", "3y", "4y", "5y",
  ]),
  billing_cycle: z.enum([
    "monthly", "quarterly", "annual",
    "biennial", "triennial", "one-time",
  ]),
  cost: z.preprocess(
    (v) => Number(v),
    z.number().min(0.01, "Cost must be positive")
  ),
  currency_id: z.string().min(1, "Currency is required"),
  recurring: z.boolean().default(true),
  reminder_days: z.number().min(1).max(30).default(7),
  end_date: z.string().optional(),
});

type FormValues = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormProps {
  subscription?: Partial<Subscription>;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
}

export default function SubscriptionForm({
  subscription,
  onSubmit,
  onCancel,
}: SubscriptionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Form handling
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
      start_date: subscription?.start_date ?? format(new Date(), "yyyy-MM-dd"),
      duration: (subscription?.duration as FormValues["duration"]) ?? "1y",
      billing_cycle:
        (subscription?.billing_cycle as FormValues["billing_cycle"]) ?? "monthly",
      cost: subscription?.cost ?? 0,
      recurring: subscription?.recurring ?? true,
      reminder_days: subscription?.reminder_days ?? 7,
      end_date: subscription?.end_date ?? "",
    },
  });

  // --- Calculate end date live
  const startDate = watch("start_date");
  const duration = watch("duration");
  const calcEnd = (s: string, d: FormValues["duration"]) => {
    const dt = new Date(s);
    switch (d) {
      case "7d": return format(addDays(dt, 7), "yyyy-MM-dd");
      case "30d": return format(addDays(dt, 30), "yyyy-MM-dd");
      case "45d": return format(addDays(dt, 45), "yyyy-MM-dd");
      case "60d": return format(addDays(dt, 60), "yyyy-MM-dd");
      case "90d": return format(addDays(dt, 90), "yyyy-MM-dd");
      case "6m": return format(addMonths(dt, 6), "yyyy-MM-dd");
      case "1y": return format(addYears(dt, 1), "yyyy-MM-dd");
      case "2y": return format(addYears(dt, 2), "yyyy-MM-dd");
      case "3y": return format(addYears(dt, 3), "yyyy-MM-dd");
      case "4y": return format(addYears(dt, 4), "yyyy-MM-dd");
      case "5y": return format(addYears(dt, 5), "yyyy-MM-dd");
      default:   return format(dt, "yyyy-MM-dd");
    }
  };

  // --- Load categories/currencies
  useEffect(() => {
    (async () => {
      try {
        const [cats] = await Promise.all([fetchCategories()]);
        setCategories(cats);
      } catch (e) {
        console.error("Lookup load error:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // --- Submit handler
  const onSubmitHandler: SubmitHandler<FormValues> = async (data) => {
    const end_date = calcEnd(data.start_date, data.duration);
    await onSubmit({ ...data, end_date });
  };

  if (isLoading) return <div>Loading form data…</div>;

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6 max-w-xl">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Abbonamento</label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
      </div>

      {/* Cost */}
      <div>
        <label htmlFor="cost" className="block text-sm font-medium mb-1">Costo</label>
        <input
          id="cost"
          type="number"
          step="0.01"
          {...register("cost", { valueAsNumber: true })}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.cost && <p className="text-red-600 text-sm mt-1">{errors.cost.message}</p>}
      </div>

      {/* Categoria */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium mb-1">Categoria</label>
        <select
          id="category_id"
          {...register("category_id")}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">Seleziona categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {errors.category_id && <p className="text-red-600 text-sm mt-1">{errors.category_id.message}</p>}
      </div>

      {/* Start date */}
      <div>
        <label htmlFor="start_date" className="block text-sm font-medium mb-1">Data inizio</label>
        <input
          id="start_date"
          type="date"
          {...register("start_date")}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.start_date && <p className="text-red-600 text-sm mt-1">{errors.start_date.message}</p>}
      </div>

      {/* Durata */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium mb-1">Durata</label>
        <select
          id="duration"
          {...register("duration")}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">Seleziona durata</option>
          <option value="7d">7 giorni</option>
          <option value="30d">30 giorni</option>
          <option value="45d">45 giorni</option>
          <option value="60d">60 giorni</option>
          <option value="90d">90 giorni</option>
          <option value="6m">6 mesi</option>
          <option value="1y">1 anno</option>
          <option value="2y">2 anni</option>
          <option value="3y">3 anni</option>
          <option value="4y">4 anni</option>
          <option value="5y">5 anni</option>
        </select>
        {errors.duration && <p className="text-red-600 text-sm mt-1">{errors.duration.message}</p>}
      </div>

      {/* Ciclo di fatturazione */}
      <div>
        <label htmlFor="billing_cycle" className="block text-sm font-medium mb-1">Ciclo di fatturazione</label>
        <select
          id="billing_cycle"
          {...register("billing_cycle")}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">Seleziona ciclo</option>
          <option value="monthly">Mensile</option>
          <option value="quarterly">Trimestrale</option>
          <option value="annual">Annuale</option>
          <option value="biennial">Biennale</option>
          <option value="triennial">Triennale</option>
          <option value="one-time">Una tantum</option>
        </select>
        {errors.billing_cycle && <p className="text-red-600 text-sm mt-1">{errors.billing_cycle.message}</p>}
      </div>

      {/* Descrizione (opzionale) */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">Descrizione (opzionale)</label>
        <textarea
          id="description"
          {...register("description")}
          className="w-full rounded-md border px-3 py-2"
          rows={2}
        />
      </div>

      {/* End date (calcolata) */}
      <div>
        <label className="block text-sm font-medium mb-1">Data di fine (calcolata)</label>
        <input
          type="text"
          value={calcEnd(startDate, duration)}
          readOnly
          className="w-full rounded-md border px-3 py-2 bg-gray-50"
        />
      </div>

      {/* Reminder days */}
      <div>
        <label htmlFor="reminder_days" className="block text-sm font-medium mb-1">
          Giorni di preavviso promemoria (1-30)
        </label>
        <input
          id="reminder_days"
          type="number"
          min={1}
          max={30}
          {...register("reminder_days", { valueAsNumber: true })}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.reminder_days && <p className="text-red-600 text-sm mt-1">{errors.reminder_days.message}</p>}
      </div>

      {/* Ricorrente */}
      <div className="flex items-center">
        <input
          id="recurring"
          type="checkbox"
          {...register("recurring")}
          className="mr-2"
        />
        <label htmlFor="recurring" className="text-sm font-medium">Abbonamento ricorrente</label>
      </div>

      {/* Submit / Cancel */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting
            ? "Processing…"
            : subscription
            ? "Update"
            : "Create"} Subscription
        </button>
      </div>
    </form>
  );
}


