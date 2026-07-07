import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NominatimSelect } from "@/components/maps/NominatimSelect";
import { OSMMapPicker } from "@/components/maps/OSMMapPicker";

type LocationMapDetailsProps = {
  city: string; onCityChange: (v: string) => void;
  district: string; onDistrictChange: (v: string) => void;
  locationMapLink: string; onLocationMapLinkChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  showMapPreviewOnBookingPage?: boolean; onShowMapPreviewOnBookingPageChange?: (v: boolean) => void;
  fetchCityDistrictFromCoords: (lat: number, lon: number) => Promise<{ city: string; district: string } | null>;
  fetchCoordsFromCityDistrict: (city: string, district: string) => Promise<{ lat: number; lon: number } | null>;
};

export function LocationMapDetails({
  city, onCityChange, district, onDistrictChange, locationMapLink, onLocationMapLinkChange,
  onLocationChange, showMapPreviewOnBookingPage, onShowMapPreviewOnBookingPageChange,
  fetchCityDistrictFromCoords, fetchCoordsFromCityDistrict
}: LocationMapDetailsProps) {
  return (
    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
      <h4 className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Map Location Details <span className="text-zinc-400 font-normal">(optional)</span></h4>
      <div className="space-y-2">
        <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">City &amp; District</Label>
        <NominatimSelect cityValue={city} districtValue={district} onSelect={async (c, d) => {
          onCityChange(c); onDistrictChange(d); onLocationChange(`${c}, ${d}`);
          const coords = await fetchCoordsFromCityDistrict(c, d);
          if (coords) onLocationMapLinkChange(`https://www.google.com/maps?q=${coords.lat},${coords.lon}`);
        }} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="coordinates" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Coordinates <span className="text-zinc-400 font-normal">(optional, e.g. 7.2905715, 80.6337262)</span></Label>
        <Input id="coordinates" placeholder="Paste exact coordinates (latitude, longitude)..."
          value={locationMapLink ? `${parseFloat(locationMapLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)?.[1] || "") || ""}, ${parseFloat(locationMapLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)?.[2] || "") || ""}` : ""}
          onChange={async (e) => {
            const val = e.target.value; const match = val.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
            if (match) {
              const lat = parseFloat(match[1]); const lon = parseFloat(match[2]);
              if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                onLocationMapLinkChange(`https://www.google.com/maps?q=${lat},${lon}`);
                const res = await fetchCityDistrictFromCoords(lat, lon);
                if (res) { onCityChange(res.city); onDistrictChange(res.district); onLocationChange(`${res.city}, ${res.district}`); }
              }
            }
          }}
          className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Base Location Map Preview</Label>
        <OSMMapPicker
          lat={locationMapLink ? parseFloat(locationMapLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)?.[1] || "") || undefined : undefined}
          lon={locationMapLink ? parseFloat(locationMapLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)?.[2] || "") || undefined : undefined}
          city={city} district={district}
          onChange={async (lat, lon) => {
            onLocationMapLinkChange(`https://www.google.com/maps?q=${lat},${lon}`);
            const res = await fetchCityDistrictFromCoords(lat, lon);
            if (res) { onCityChange(res.city); onDistrictChange(res.district); onLocationChange(`${res.city}, ${res.district}`); }
          }} height="250px"
        />
        {locationMapLink && <p className="text-[10px] text-zinc-400 font-medium truncate mt-1">Google Maps Link: <span className="text-zinc-650 dark:text-zinc-400 font-mono">{locationMapLink}</span></p>}
      </div>
      {onShowMapPreviewOnBookingPageChange && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="space-y-0.5">
            <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Show Map Preview on Booking Page</Label>
            <p className="text-[11px] text-zinc-500">If disabled, only the city/district will be shown as text.</p>
          </div>
          <button type="button" onClick={() => onShowMapPreviewOnBookingPageChange(!showMapPreviewOnBookingPage)} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showMapPreviewOnBookingPage ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-600"}`}>
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showMapPreviewOnBookingPage ? "translate-x-4" : "translate-x-0"}`} />
          </button>
        </div>
      )}
    </div>
  );
}
