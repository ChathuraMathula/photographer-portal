"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export type CustomPackageValues = {
  name: string;
  description: string;
  price: number;
  durationHours: number;
  depositType: "universal" | "fixed" | "percentage";
  depositValue: number;
  includes: string[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CustomPackageValues) => void;
  initialValues?: CustomPackageValues;
};

export function CustomPackageModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: Props) {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [price, setPrice] = useState(initialValues?.price || 0);
  const [durationHours, setDurationHours] = useState(initialValues?.durationHours || 1);
  const [depositType, setDepositType] = useState<"universal" | "fixed" | "percentage">(
    initialValues?.depositType || "universal"
  );
  const [depositValue, setDepositValue] = useState(initialValues?.depositValue || 0);
  const [includesText, setIncludesText] = useState(
    initialValues?.includes ? initialValues.includes.join(", ") : ""
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Package name is required";
    if (price <= 0) newErrors.price = "Price must be positive";
    if (durationHours <= 0) newErrors.durationHours = "Duration must be positive";

    if (depositType === "fixed" && depositValue > price) {
      newErrors.depositValue = "Deposit cannot exceed package price";
    }
    if (depositType === "percentage" && depositValue > 100) {
      newErrors.depositValue = "Percentage cannot exceed 100%";
    }
    if (depositValue < 0) {
      newErrors.depositValue = "Deposit value cannot be negative";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const includes = includesText
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    onSubmit({
      name,
      description,
      price,
      durationHours,
      depositType,
      depositValue,
      includes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <form
        onSubmit={handleFormSubmit}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-white dark:bg-zinc-900 dark:border-zinc-800 shrink-0">
          <h2 className="text-title-medium text-primary-dark dark:text-white font-bold">
            Create Custom Package
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          <div className="space-y-2">
            <Label htmlFor="cust-name" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Package Name</Label>
            <Input
              id="cust-name"
              placeholder="e.g. Special Customized Portrait Package"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cust-description" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Description</Label>
            <textarea
              id="cust-description"
              rows={2}
              placeholder="Describe custom features tailored for this client..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-body-small focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-850 dark:bg-zinc-950 text-zinc-750 dark:text-zinc-305 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cust-price" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Price (LKR)</Label>
              <Input
                id="cust-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cust-duration" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Duration (Hours)</Label>
              <Input
                id="cust-duration"
                type="number"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              {errors.durationHours && <p className="text-red-500 text-xs mt-1">{errors.durationHours}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cust-includes" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Included Items{" "}
              <span className="text-zinc-400 font-normal">(comma separated)</span>
            </Label>
            <Input
              id="cust-includes"
              placeholder="e.g. 2 Hours coverage, custom studio, all digital copy"
              value={includesText}
              onChange={(e) => setIncludesText(e.target.value)}
              className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
            />
            <p className="text-body-caption text-zinc-455 mt-1 pl-1">Separate items by comma.</p>
          </div>

          {/* Deposit Rules configuration */}
          <div className="border-t pt-4 mt-2 dark:border-zinc-800 space-y-4">
            <h3 className="text-body-small-s font-semibold text-zinc-800 dark:text-zinc-200">Advanced Payment Policy</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cust-depositType" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                  Deposit Rule
                </Label>
                <select
                  id="cust-depositType"
                  value={depositType}
                  onChange={(e: any) => setDepositType(e.target.value)}
                  className="w-full h-[50px] bg-white dark:bg-zinc-950 text-body-small border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-primary-dark cursor-pointer"
                >
                  <option value="universal">Use Universal Default</option>
                  <option value="fixed">Fixed Price (LKR)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              {depositType !== "universal" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor="cust-depositValue" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                    {depositType === "fixed" ? "Deposit Value (LKR)" : "Deposit Value (%)"}
                  </Label>
                  <Input
                    id="cust-depositValue"
                    type="number"
                    min="0"
                    value={depositValue}
                    onChange={(e) => setDepositValue(Number(e.target.value))}
                    className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
                  />
                  {errors.depositValue && <p className="text-red-500 text-xs mt-1">{errors.depositValue}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 dark:border-zinc-800 grid grid-cols-2 gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="btn btn-secondary btn-modal h-11 py-0 px-6 shadow-sm animate-in fade-in duration-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="btn btn-primary btn-modal h-11 py-0 px-6 shadow-sm animate-in fade-in duration-100"
          >
            Save Custom Package
          </Button>
        </div>
      </form>
    </div>
  );
}
