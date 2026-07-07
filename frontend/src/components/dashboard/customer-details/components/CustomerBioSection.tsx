"use client";

import React from "react";

interface CustomerBioSectionProps {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  customerNotes?: string;
}

export function CustomerBioSection({
  customer,
  customerNotes,
}: CustomerBioSectionProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-body-caption font-semibold text-zinc-400">
            Client Name
          </p>
          <p className="text-body-small-s font-semibold text-zinc-950 dark:text-white">
            {customer.firstName} {customer.lastName}
          </p>
        </div>
        <div>
          <p className="text-body-caption font-semibold text-zinc-400">
            Contact
          </p>
          <p className="text-body-small-s text-zinc-700 dark:text-zinc-300 truncate">
            {customer.email}
          </p>
          {customer.phone && (
            <p className="text-body-caption text-zinc-400 mt-0.5">
              {customer.phone}
            </p>
          )}
        </div>
      </div>

      {customerNotes && (
        <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <p className="text-body-caption font-semibold text-zinc-400">
            Client Notes
          </p>
          <p className="text-body-small italic text-zinc-500 mt-0.5 font-medium">
            "{customerNotes}"
          </p>
        </div>
      )}
    </>
  );
}
