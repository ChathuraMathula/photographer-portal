import { type FormikProps } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LocationPickerFormFields } from "@/components/maps/LocationPickerFormFields";
import { CreateUserValues } from "../CreateUserModal";

type Props = {
  formik: FormikProps<CreateUserValues>;
  specsInput: string;
  specsList: string[];
  onSpecsInputChange: (v: string) => void;
  onAddSpec: () => void;
  onRemoveSpec: (spec: string) => void;
};

export function CreateUserPhotographerFields({ formik, specsInput, specsList, onSpecsInputChange, onAddSpec, onRemoveSpec }: Props) {
  return (
    <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
      <h3 className="text-body-small-s font-semibold text-zinc-900 dark:text-white">Photographer Profile Settings</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cu-bookingSlug" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Booking Link Slug <span className="text-zinc-400 font-normal text-body-caption">(optional)</span></Label>
          <Input id="cu-bookingSlug" placeholder="e.g. sarah-johnson" {...formik.getFieldProps("bookingSlug")} className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950" />
          <p className="text-body-caption text-zinc-455 mt-1 pl-1">If left blank, slug will generate from name.</p>
        </div>
      </div>
      <div className="border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-4">
        <h4 className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Base Location Map Details <span className="text-zinc-400 font-normal">(optional)</span></h4>
        <LocationPickerFormFields formik={formik as any} isRequired={false} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cu-bio" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Short Biography</Label>
        <Input id="cu-bio" placeholder="Wedding & portrait photographer with 5 years experience..." {...formik.getFieldProps("bio")} className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950" />
      </div>
      <div className="space-y-2">
        <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Specializations</Label>
        <div className="flex gap-2">
          <Input value={specsInput} onChange={(e) => onSpecsInputChange(e.target.value)} placeholder="e.g. Wedding, Portrait, Corporate" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAddSpec(); } }} className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950" />
          <Button type="button" onClick={onAddSpec} className="btn btn-secondary h-[50px] py-0 min-w-0 md:min-w-0 px-4 shadow-sm animate-in fade-in duration-100">Add</Button>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {specsList.map((spec) => (
            <span key={spec} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-body-caption font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 animate-in fade-in zoom-in-95 duration-100">
              {spec}
              <button type="button" onClick={() => onRemoveSpec(spec)} className="text-zinc-400 hover:text-zinc-650 focus:outline-none cursor-pointer">&times;</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
