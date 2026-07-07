"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormFieldsProps { name: string; setName: (val: string) => void; description: string; setDescription: (val: string) => void; price: number; setPrice: (val: number) => void; durationHours: number; setDurationHours: (val: number) => void; includesText: string; setIncludesText: (val: string) => void; errors: Record<string, string>; }

export function CustomPackageFormFields({ name, setName, description, setDescription, price, setPrice, durationHours, setDurationHours, includesText, setIncludesText, errors }: FormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="cust-name" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Package Name</Label>
        <Input id="cust-name" placeholder="e.g. Special Customized Portrait Package" value={name} onChange={(e) => setName(e.target.value)} className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="cust-description" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Description</Label>
        <textarea id="cust-description" rows={2} placeholder="Describe custom features tailored for this client..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-body-small focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-850 dark:bg-zinc-950 text-zinc-750 dark:text-zinc-305 transition-all" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cust-price" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Price (LKR)</Label>
          <Input id="cust-price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950" />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cust-duration" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Duration (Hours)</Label>
          <Input id="cust-duration" type="number" value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))} className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950" />
          {errors.durationHours && <p className="text-red-500 text-xs mt-1">{errors.durationHours}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cust-includes" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Included Items <span className="text-zinc-400 font-normal">(comma separated)</span></Label>
        <Input id="cust-includes" placeholder="e.g. 2 Hours coverage, custom studio, all digital copy" value={includesText} onChange={(e) => setIncludesText(e.target.value)} className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950" />
        <p className="text-body-caption text-zinc-455 mt-1 pl-1">Separate items by comma.</p>
      </div>
    </>
  );
}
