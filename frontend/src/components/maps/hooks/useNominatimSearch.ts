import { useState, useRef, useEffect } from "react";

export function useNominatimSearch() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{ city: string; district: string; display: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=lk&featuretype=settlement&format=json&addressdetails=1&limit=8`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (res.ok) {
        const data = await res.json();
        const results = data
          .map((item: any) => {
            const addr = item.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.suburb ||
              addr.village ||
              item.name ||
              "";
            const district = addr.county || addr.state || "";
            const display = [city, district].filter(Boolean).join(", ");
            return { city, district, display };
          })
          .filter((item: any) => item.city);
        const unique = Array.from(
          new Map(results.map((r: any) => [r.display, r])).values(),
        ) as any;
        setSuggestions(unique);
      }
    } catch (err) {
      console.error("Nominatim suggestion fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 450);
  };

  return {
    open,
    setOpen,
    searchTerm,
    setSearchTerm,
    suggestions,
    setSuggestions,
    loading,
    containerRef,
    handleTyping,
  };
}
