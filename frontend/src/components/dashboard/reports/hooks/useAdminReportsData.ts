import { useState, useEffect } from "react";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function useAdminReportsData() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly" | "custom">("monthly");
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split("T")[0]; });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(() => (new Date().getMonth() + 1).toString().padStart(2, "0"));

  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingFinancial, setDownloadingFinancial] = useState(false);
  const [downloadingBookings, setDownloadingBookings] = useState(false);
  const [downloadingLocation, setDownloadingLocation] = useState(false);
  const [bookingsData, setBookingsData] = useState<any>(null);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const getPeriodDateRange = () => {
    if (period === "yearly") return { start: `${selectedYear}-01-01`, end: `${selectedYear}-12-31` };
    if (period === "monthly") return { start: `${selectedYear}-${selectedMonth}-01`, end: `${selectedYear}-${selectedMonth}-${new Date(Number(selectedYear), Number(selectedMonth), 0).getDate().toString().padStart(2, "0")}` };
    return { start: startDate, end: endDate };
  };

  const getUrl = (endpoint: string, page?: number, search?: string) => {
    let url = `${API}/reports/${endpoint}?period=${period}`;
    if (page) url += `&page=${page}&limit=${endpoint === "leaderboard" ? 5 : 10}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (period === "custom") url += `&startDate=${startDate}&endDate=${endDate}`;
    else if (period === "yearly" || period === "monthly") { const r = getPeriodDateRange(); url += `&startDate=${r.start}&endDate=${r.end}`; }
    return url;
  };

  const fetchData = async (endpoint: string, setter: (d: any) => void, setLoadingState: (b: boolean) => void, errMessage: string, page?: number, search?: string) => {
    setLoadingState(true);
    try {
      const res = await fetch(getUrl(endpoint, page, search), { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      setter(await res.json());
    } catch { toast.error(errMessage); } finally { setLoadingState(false); }
  };

  useEffect(() => {
    if (period === "custom" && (!startDate || !endDate)) return;
    fetchData("data", setReportData, (b) => reportData === null ? setLoading(b) : setRefreshing(b), "Could not load reports");
  }, [period, startDate, endDate, selectedYear, selectedMonth]);

  useEffect(() => {
    if (period === "custom" && (!startDate || !endDate)) return;
    fetchData("bookings", setBookingsData, setBookingsLoading, "Could not load bookings list", bookingsPage);
  }, [period, startDate, endDate, selectedYear, selectedMonth, bookingsPage]);

  useEffect(() => {
    if (period === "custom" && (!startDate || !endDate)) return;
    const delay = setTimeout(() => fetchData("leaderboard", setLeaderboardData, setLeaderboardLoading, "Could not load leaderboard", leaderboardPage, leaderboardSearch), 300);
    return () => clearTimeout(delay);
  }, [period, startDate, endDate, selectedYear, selectedMonth, leaderboardPage, leaderboardSearch]);

  const handleDownload = async (type: string, setDownloading: (v: boolean) => void) => {
    setDownloading(true);
    try {
      const res = await fetch(getUrl(`pdf/${type}`), { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const a = document.createElement("a"); a.href = window.URL.createObjectURL(await res.blob()); a.download = `system_${type}_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a); a.click(); a.remove(); toast.success(`${type} report downloaded!`);
    } catch { toast.error("Failed to download PDF"); } finally { setDownloading(false); }
  };

  return {
    period, setPeriod, startDate, setStartDate, endDate, setEndDate, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth,
    reportData, loading, refreshing, downloadingFinancial, downloadingBookings, downloadingLocation,
    handleDownloadFinancial: () => handleDownload("financial", setDownloadingFinancial), handleDownloadBookings: () => handleDownload("bookings", setDownloadingBookings), handleDownloadLocation: () => handleDownload("location", setDownloadingLocation),
    bookingsData, bookingsPage, setBookingsPage, bookingsLoading, leaderboardData, leaderboardPage, setLeaderboardPage, leaderboardSearch, setLeaderboardSearch, leaderboardLoading
  };
}
