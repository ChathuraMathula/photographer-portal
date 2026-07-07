"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Loader2 } from "lucide-react";
import { useAdminProfile } from "./hooks/useAdminProfile";
import { AdminProfileFormFields } from "./components/AdminProfileFormFields";

export function AdminProfilePage() {
  const { formik, loading, saving } = useAdminProfile();

  if (loading) return (
    <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-500" /></div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/20">
          <CardTitle className="text-title-medium text-primary-dark dark:text-white flex items-center gap-2"><User className="h-5 w-5 text-zinc-400" /> Personal Account Profile</CardTitle>
          <CardDescription>Update your administrator details, email configurations, and password settings.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <AdminProfileFormFields formik={formik} saving={saving} />
        </CardContent>
      </Card>
    </div>
  );
}
