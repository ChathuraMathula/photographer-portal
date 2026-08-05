import React, { useRef, useEffect, useState } from "react";
import { type FormikProps } from "formik";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type AvailabilityValues } from "./AvailabilityForm";
import { CustomerDetailsNameFields } from "./components/CustomerDetailsNameFields";
import { CustomerDetailsContactFields } from "./components/CustomerDetailsContactFields";
import { CustomerDetailsLocationFields } from "./components/CustomerDetailsLocationFields";
import { UserCheck, Users } from "lucide-react";

export type CustomerDetailsValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  city: string;
  district: string;
  locationMapLink: string;
  coordinates: string;
  notes: string;
};

type Props = {
  formik: FormikProps<CustomerDetailsValues>;
  availabilityChecked: AvailabilityValues;
  onBack: () => void;
};

interface LoggedInCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function CustomerDetailsForm({
  formik,
  availabilityChecked,
  onBack,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const auth = useSelector((state: RootState) => state.auth);
  const [customerData, setCustomerData] = useState<LoggedInCustomer | null>(null);
  const [bookForOthers, setBookForOthers] = useState(false);

  useEffect(() => {
    if (formik.submitCount > 0 && !formik.isValid) {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formik.submitCount, formik.isValid]);

  // Fetch logged in customer profile if available
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
        const res = await fetch(`${API}/auth/customer/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data && data.email) {
            const customer = {
              firstName: data.firstName || auth.firstName || "",
              lastName: data.lastName || "",
              email: data.email || auth.email || "",
              phone: data.phone || "",
            };
            setCustomerData(customer);

            // Auto-fill if initial formik values are empty
            if (!formik.values.email) {
              formik.setFieldValue("firstName", customer.firstName);
              formik.setFieldValue("lastName", customer.lastName);
              formik.setFieldValue("email", customer.email);
              formik.setFieldValue("phone", customer.phone);
            }
          }
        }
      } catch (err) {
        // Guest user or error fetching profile
      }
    };

    fetchCustomer();
  }, [auth]);

  const handleToggleBookForOthers = (enable: boolean) => {
    setBookForOthers(enable);
    if (enable) {
      // Clear contact fields so user can type details for someone else
      formik.setFieldValue("firstName", "");
      formik.setFieldValue("lastName", "");
      formik.setFieldValue("email", "");
      formik.setFieldValue("phone", "");
    } else if (customerData) {
      // Restore logged-in customer's profile details
      formik.setFieldValue("firstName", customerData.firstName);
      formik.setFieldValue("lastName", customerData.lastName);
      formik.setFieldValue("email", customerData.email);
      formik.setFieldValue("phone", customerData.phone);
    }
  };

  return (
    <Card ref={cardRef} className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm scroll-mt-6">
      <CardHeader>
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">
          Your Details
        </CardTitle>
        <CardDescription className="text-body-small text-zinc-500 mt-1">
          {availabilityChecked.date} · {availabilityChecked.startTime}–
          {availabilityChecked.endTime} · {availabilityChecked.eventType} ·{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            Available
          </span>
        </CardDescription>
      </CardHeader>

      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-4 pb-4">
          {/* Book for someone else Toggle Banner */}
          {customerData && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
              <div className="space-y-0.5 pr-3">
                <span className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  Book for someone else
                </span>
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 block leading-tight">
                  {bookForOthers
                    ? "Enter the recipient's name, email, and phone number."
                    : `Pre-filled with your account (${customerData.email}). Switch on to enter someone else's details.`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleBookForOthers(!bookForOthers)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  bookForOthers ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-600"
                }`}
                aria-label="Toggle Book for someone else"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    bookForOthers ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

          {formik.status && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 text-body-small-s text-red-650 dark:text-red-400 border border-red-250/20">
              {formik.status}
            </div>
          )}

          <CustomerDetailsNameFields formik={formik} />
          <CustomerDetailsContactFields formik={formik} />
          <CustomerDetailsLocationFields formik={formik} />
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            type="button"
            className="btn btn-secondary w-full flex-1 min-w-0 md:min-w-0 h-11 py-0 shadow-sm"
            onClick={onBack}
            variant="outline"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="btn btn-primary w-full flex-1 min-w-0 md:min-w-0 h-11 py-0 shadow-sm"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
