"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { format, addDays, addMonths, addYears } from "date-fns";

import { fetchCategories, fetchCurrencies } from "@/lib/supabase/db";
import type { Subscription, Category, Currency } from "@/types";

/* ---------------------------- ZOD SCHEMA ---------------------------- */
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
  /* ---------------- stato local ---------------- */
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------------- useForm (UNO solo) --------- */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(subscriptionSchema),   // ✅ nessun generic extra
    defaultValues: {
      name: subscription?.name ?? "",
      description: subscription?.description ?? "",
      category_id: subscription?.category_id ?? "",
      start_date: subscription?.start_date ?? format(new Date(), "yyyy-MM-dd"),
      duration: (subscription?.duration as FormValues["duration"]) ?? "1y",
      billing_cycle:
        (subscription?.billing_cycle as FormValues["billing_cycle"]) ?? "monthly",
      cost: subscription?.cost ?? 0,
      currency_id: subscription?.currency_id ?? "",
      recurring: subscription?.recurring ?? true,
      reminder_days: subscription?.reminder_days ?? 7,
      end_date: subscription?.end_date ?? "",
    },
  });

  /* ---------------- helper date --------------- */
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

  /* ------------- carica categorie / valute ---- */
  useEffect(() => {
    (async () => {
      try {
        const [cats, curs] = await Promise.all([fetchCategories(), fetchCurrencies()]);
        setCategories(cats);
        setCurrencies(curs);
      } catch (e) {
        console.error("Lookup load error:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /* ---------------- submit handler ------------- */
  const onSubmitHandler: SubmitHandler<FormValues> = async (data) => {
    const end_date = calcEnd(data.start_date, data.duration);
    await onSubmit({ ...data, end_date });
  };

  /* ---------------- rendering ------------------ */
  if (isLoading) return <div>Loading form data…</div>;

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6 max-w-xl">
      {/* ======= NAME ======= */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
      </div>

      {/* ======= COST (come esempio) ======= */}
      <div>
        <label htmlFor="cost" className="block text-sm font-medium mb-1">Cost</label>
        <input
          id="cost"
          type="number"
          step="0.01"
          {...register("cost", { valueAsNumber: true })}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.cost && <p className="text-red-600 text-sm mt-1">{errors.cost.message}</p>}
      </div>

      {/* --- Altri campi identici… (categoria, date, ecc.) --- */}

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


