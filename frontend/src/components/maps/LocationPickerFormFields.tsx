import React from "react";
import { type FormikProps } from "formik";
import { useBookingGeocoding } from "@/components/booking/hooks/useBookingGeocoding";
import { LocationPickerCityDistrict } from "./components/LocationPickerCityDistrict";
import { LocationPickerCoordinates } from "./components/LocationPickerCoordinates";
import { LocationPickerMapPreview } from "./components/LocationPickerMapPreview";

export type LocationPickerFormValues = {
  city: string;
  district: string;
  locationMapLink: string;
  coordinates?: string;
};
type Props<T extends LocationPickerFormValues> = {
  formik: FormikProps<T>;
  isRequired?: boolean;
};

export function LocationPickerFormFields<T extends LocationPickerFormValues>({
  formik,
  isRequired = false,
}: Props<T>) {
  const {
    geocodingStatus,
    fetchCityDistrictFromCoords,
    fetchCoordsFromCityDistrict,
  } = useBookingGeocoding();

  const handleCoordinatesChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value;
    formik.setFieldValue("coordinates", val);
    const match = val.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
    if (match) {
      const lat = parseFloat(match[1]),
        lon = parseFloat(match[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        formik.setFieldValue(
          "locationMapLink",
          `https://www.google.com/maps?q=${lat},${lon}`,
        );
        const res = await fetchCityDistrictFromCoords(lat, lon);
        if (res) {
          formik.setFieldValue("city", res.city);
          formik.setFieldValue("district", res.district);
          if ("baseLocation" in formik.values)
            formik.setFieldValue(
              "baseLocation",
              `${res.city}, ${res.district}`,
            );
        }
      }
    }
  };

  const handleNominatimSelect = async (city: string, district: string) => {
    formik.setFieldValue("city", city);
    formik.setFieldValue("district", district);
    if ("baseLocation" in formik.values)
      formik.setFieldValue("baseLocation", `${city}, ${district}`);
    if (!formik.values.coordinates) {
      const coords = await fetchCoordsFromCityDistrict(city, district);
      if (coords)
        formik.setFieldValue(
          "locationMapLink",
          `https://www.google.com/maps?q=${coords.lat},${coords.lon}`,
        );
    }
  };

  const handleMapPickerChange = async (lat: number, lon: number) => {
    formik.setFieldValue(
      "locationMapLink",
      `https://www.google.com/maps?q=${lat},${lon}`,
    );
    formik.setFieldValue("coordinates", `${lat.toFixed(7)}, ${lon.toFixed(7)}`);
    const res = await fetchCityDistrictFromCoords(lat, lon);
    if (res) {
      formik.setFieldValue("city", res.city);
      formik.setFieldValue("district", res.district);
      if ("baseLocation" in formik.values)
        formik.setFieldValue("baseLocation", `${res.city}, ${res.district}`);
    }
  };

  const hasError =
    ((formik.touched as any).city && (formik.errors as any).city) ||
    ((formik.touched as any).district && (formik.errors as any).district);

  return (
    <div className="space-y-4">
      <LocationPickerCityDistrict
        formik={formik}
        isRequired={isRequired}
        onNominatimSelect={handleNominatimSelect}
        hasError={hasError}
      />
      <LocationPickerCoordinates
        formik={formik}
        geocodingStatus={geocodingStatus}
        onCoordinatesChange={handleCoordinatesChange as any}
      />
      <LocationPickerMapPreview
        formik={formik}
        isRequired={isRequired}
        onMapPickerChange={handleMapPickerChange}
      />
    </div>
  );
}
