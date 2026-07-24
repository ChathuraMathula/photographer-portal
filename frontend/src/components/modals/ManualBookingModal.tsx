import React from "react";
import { type FormikProps } from "formik";
import { Button } from "@/components/ui/button";
import { type Package } from "@/types";
import { ModalLayout } from "@/components/modals/ModalLayout";
import { ManualBookingClientFields } from "@/components/modals/manual-booking/components/ManualBookingClientFields";
import { ManualBookingTimeFields } from "@/components/modals/manual-booking/components/ManualBookingTimeFields";
import { ManualBookingLocationFields } from "@/components/modals/manual-booking/components/ManualBookingLocationFields";
import { ManualBookingPackageFields } from "@/components/modals/manual-booking/components/ManualBookingPackageFields";

export type ManualBookingValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  location: string;
  city: string;
  district: string;
  locationMapLink: string;
  coordinates: string;
  notes: string;
  packageId: string;
  advancePaymentLkr: string | number;
  totalAmountLkr: string | number;
};

type Props = {
  formik: FormikProps<ManualBookingValues>;
  onClose: () => void;
  allowedEventTypes?: string[];
  allowCustomEventTypes?: boolean;
  packages?: Package[];
  universalDepositType?: string;
  universalDepositValue?: number;
};

export function ManualBookingModal({
  formik,
  onClose,
  allowedEventTypes = [],
  allowCustomEventTypes = true,
  packages = [],
  universalDepositType = "fixed",
  universalDepositValue = 5000,
}: Props) {
  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        className="btn btn-secondary btn-modal h-11 py-0 px-6 shadow-sm flex-1 animate-in fade-in duration-100"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className="btn btn-primary btn-modal h-11 py-0 px-6 shadow-sm flex-1 animate-in fade-in duration-100"
      >
        Book Event
      </Button>
    </div>
  );

  return (
    <ModalLayout
      title="Manual Booking"
      onClose={handleClose}
      onSubmit={formik.handleSubmit}
      footer={footer}
    >
      <ManualBookingClientFields formik={formik} />
      <ManualBookingTimeFields formik={formik} />
      <ManualBookingLocationFields
        formik={formik}
        allowedEventTypes={allowedEventTypes}
        allowCustomEventTypes={allowCustomEventTypes}
      />
      <ManualBookingPackageFields
        formik={formik}
        packages={packages}
        universalDepositType={universalDepositType}
        universalDepositValue={universalDepositValue}
      />
    </ModalLayout>
  );
}
