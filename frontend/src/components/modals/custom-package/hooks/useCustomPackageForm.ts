"use client";

import { useState } from "react";
import { type CustomPackageValues } from "@/components/modals/CustomPackageModal";

interface FormProps {
  initialValues?: CustomPackageValues;
  onSubmit: (values: CustomPackageValues) => void;
  onClose: () => void;
}

export function useCustomPackageForm({
  initialValues,
  onSubmit,
  onClose,
}: FormProps) {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(
    initialValues?.description || "",
  );
  const [price, setPrice] = useState(initialValues?.price || 0);
  const [durationHours, setDurationHours] = useState(
    initialValues?.durationHours || 1,
  );
  const [depositType, setDepositType] = useState<
    "universal" | "fixed" | "percentage"
  >(initialValues?.depositType || "universal");
  const [depositValue, setDepositValue] = useState(
    initialValues?.depositValue || 0,
  );
  const [includesText, setIncludesText] = useState(
    initialValues?.includes ? initialValues.includes.join(", ") : "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Package name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (price <= 0) newErrors.price = "Price must be positive";
    if (durationHours <= 0)
      newErrors.durationHours = "Duration must be positive";

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
      .map((i: string) => i.trim())
      .filter((i: string) => i.length > 0);

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

  return {
    name,
    setName,
    description,
    setDescription,
    price,
    setPrice,
    durationHours,
    setDurationHours,
    depositType,
    setDepositType,
    depositValue,
    setDepositValue,
    includesText,
    setIncludesText,
    errors,
    handleFormSubmit,
  };
}
