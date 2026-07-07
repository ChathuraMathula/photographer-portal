import { useState } from "react";

export function useBookingGeocoding() {
  const [geocodingStatus, setGeocodingStatus] = useState<string>("");

  const fetchCityDistrictFromCoords = async (lat: number, lon: number) => {
    setGeocodingStatus("Resolving nearest city & district from coordinates...");
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      );
      if (geoRes.ok) {
        const geoJson = await geoRes.json();
        const addr = geoJson.address || {};
        const resCity =
          addr.city ||
          addr.town ||
          addr.suburb ||
          addr.village ||
          addr.neighbourhood ||
          addr.hamlet ||
          "";
        const resDistrict = addr.county || addr.state || "";

        if (resCity && resDistrict) {
          setGeocodingStatus(
            "City & District auto-detected from coordinates. Please define the exact Venue details.",
          );
          return { city: resCity, district: resDistrict };
        } else {
          setGeocodingStatus("");
        }
      } else {
        setGeocodingStatus("");
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      setGeocodingStatus("");
    }
    return null;
  };

  const fetchCoordsFromCityDistrict = async (
    city: string,
    district: string,
  ) => {
    try {
      const query = [city, district, "Sri Lanka"].filter(Boolean).join(", ");
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query,
        )}&format=json&limit=1&accept-language=en`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lon)) {
            return { lat, lon };
          }
        }
      }
    } catch (err) {
      console.error("City center search fallback failed", err);
    }
    return null;
  };

  return {
    geocodingStatus,
    fetchCityDistrictFromCoords,
    fetchCoordsFromCityDistrict,
  };
}
