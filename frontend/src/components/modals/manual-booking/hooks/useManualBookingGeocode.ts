import { useState } from "react";
import { type FormikProps } from "formik";
import { type ManualBookingValues } from "@/components/modals/ManualBookingModal";

export function useManualBookingGeocode(formik: FormikProps<ManualBookingValues>) {
  const [geocodingStatus, setGeocodingStatus] = useState("");

  const handleCityDistrictSelect = async (city: string, district: string) => {
    formik.setFieldValue("city", city);
    formik.setFieldValue("district", district);
    if (formik.values.coordinates) return;
    try {
      const query = [city, district, "Sri Lanka"].filter(Boolean).join(", ");
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lon)) {
            formik.setFieldValue("locationMapLink", `https://www.google.com/maps?q=${lat},${lon}`);
          }
        }
      }
    } catch (err) {
      console.error("City center search fallback failed", err);
    }
  };

  const reverseGeocode = async (lat: number, lon: number, source: string) => {
    setGeocodingStatus(`Resolving nearest city & district from ${source}...`);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      if (res.ok) {
        const geoJson = await res.json();
        const addr = geoJson.address || {};
        const resCity = addr.city || addr.town || addr.suburb || addr.village || addr.neighbourhood || addr.hamlet || "";
        const resDistrict = addr.county || addr.state || "";
        if (resCity && resDistrict) {
          formik.setFieldValue("city", resCity);
          formik.setFieldValue("district", resDistrict);
          setGeocodingStatus("City & District auto-detected. Please define exact Venue.");
        } else {
          setGeocodingStatus("");
        }
      } else {
        setGeocodingStatus("");
      }
    } catch {
      setGeocodingStatus("");
    }
  };

  const handleCoordinatesChange = async (val: string) => {
    formik.setFieldValue("coordinates", val);
    const match = val.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        formik.setFieldValue("locationMapLink", `https://www.google.com/maps?q=${lat},${lon}`);
        await reverseGeocode(lat, lon, "coordinates");
      }
    }
  };

  const handleMapChange = async (lat: number, lon: number) => {
    formik.setFieldValue("locationMapLink", `https://www.google.com/maps?q=${lat},${lon}`);
    formik.setFieldValue("coordinates", `${lat.toFixed(7)}, ${lon.toFixed(7)}`);
    await reverseGeocode(lat, lon, "map marker");
  };

  return { geocodingStatus, handleCityDistrictSelect, handleCoordinatesChange, handleMapChange };
}
