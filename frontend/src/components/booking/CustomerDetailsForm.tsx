import { type FormikProps } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/common/FieldError";
import { type AvailabilityValues } from "./AvailabilityForm";

export type CustomerDetailsValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  notes: string;
};

type Props = {
  formik: FormikProps<CustomerDetailsValues>;
  availabilityChecked: AvailabilityValues;
  onBack: () => void;
};

export function CustomerDetailsForm({ formik, availabilityChecked, onBack }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Details</CardTitle>
        <CardDescription>
          {availabilityChecked.date} · {availabilityChecked.startTime}–
          {availabilityChecked.endTime} · {availabilityChecked.eventType}
          <span className="ml-2 font-medium text-emerald-600">Available</span>
        </CardDescription>
      </CardHeader>

      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-4">
          {formik.status && (
            <div className="rounded-md bg-red-100 p-3 text-sm text-red-600 dark:bg-red-900/30">
              {formik.status}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...formik.getFieldProps("firstName")}
                className={
                  formik.touched.firstName && formik.errors.firstName
                    ? "border-red-500"
                    : ""
                }
              />
              <FieldError
                msg={
                  formik.touched.firstName ? formik.errors.firstName : undefined
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...formik.getFieldProps("lastName")}
                className={
                  formik.touched.lastName && formik.errors.lastName
                    ? "border-red-500"
                    : ""
                }
              />
              <FieldError
                msg={
                  formik.touched.lastName ? formik.errors.lastName : undefined
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...formik.getFieldProps("email")}
              className={
                formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : ""
              }
            />
            <FieldError
              msg={formik.touched.email ? formik.errors.email : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...formik.getFieldProps("phone")}
              className={
                formik.touched.phone && formik.errors.phone
                  ? "border-red-500"
                  : ""
              }
            />
            <FieldError
              msg={formik.touched.phone ? formik.errors.phone : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Venue / Location{" "}
              <span className="text-zinc-400">(optional)</span>
            </Label>
            <Input
              id="location"
              placeholder="e.g. Cinnamon Grand, Colombo"
              {...formik.getFieldProps("location")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes <span className="text-zinc-400">(optional)</span>
            </Label>
            <Input
              id="notes"
              placeholder="Any special requirements..."
              {...formik.getFieldProps("notes")}
            />
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
