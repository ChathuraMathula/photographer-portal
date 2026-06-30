"use client";

import { useState, useEffect } from "react";
import { usePhotographerDashboardContext } from "../../context/PhotographerDashboardContext";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export type ReportSummary = {
  totalBookings: number;
  potentialRevenueLkr: number;
  paidRevenueLkr: number;
  pendingRevenueLkr: number;
  conversionRate: number;
};

export type ReportData = {
  period: string;
  startDateStr: string;
  endDateStr: string;
  summary: ReportSummary;
  statusDistribution: Array<{ name: string; value: number }>;
  eventTypes: Array<{ name: string; count: number }>;
  packages: Array<{ name: string; count: number; revenueLkr: number }>;
  timeline: Array<{ label: string; bookings: number; revenueLkr: number }>;
  locationData: Array<{
    id: string;
    eventType: string;
    locationMapLink?: string;
    district?: string;
    city?: string;
    location?: string;
  }>;
};

export type PaginatedBookingsData = {
  data: Array<{
    id: string;
    clientName: string;
    date: string;
    eventType: string;
    totalLkr: number;
    status: string;
    location?: string;
    locationMapLink?: string;
    city?: string;
    district?: string;
    customer?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  }>;
  total: number;
  page: number;
  totalPages: number;
};

export function useReports() {
  const context = usePhotographerDashboardContext();
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly" | "custom">("monthly");
  
  // Custom Date States
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Specific Year and Month selection states
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(() => (new Date().getMonth() + 1).toString().padStart(2, "0"));

  const [reportData, setReportData] = useState<ReportData | null>(null);
  
  // Bookings Log Pagination State
  const [bookingsData, setBookingsData] = useState<PaginatedBookingsData | null>(null);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const bookingsLimit = 10;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingFinancial, setDownloadingFinancial] = useState(false);
  const [downloadingBookings, setDownloadingBookings] = useState(false);
  const [downloadingLocation, setDownloadingLocation] = useState(false);

  // Helper to compute start & end date for the selected year or month
  const getPeriodDateRange = () => {
    if (period === "yearly") {
      return {
        start: `${selectedYear}-01-01`,
        end: `${selectedYear}-12-31`,
      };
    } else if (period === "monthly") {
      const lastDay = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate().toString().padStart(2, "0");
      return {
        start: `${selectedYear}-${selectedMonth}-01`,
        end: `${selectedYear}-${selectedMonth}-${lastDay}`,
      };
    }
    return { start: startDate, end: endDate };
  };

  const loadStats = async (showMainSpinner: boolean) => {
    if (!context) return;
    if (showMainSpinner) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    // Reset page to 1 when period/date changes
    setBookingsPage(1);

    try {
      let url = `${API}/reports/data?period=${period}`;
      if (period === "custom") {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      } else if (period === "yearly" || period === "monthly") {
        const range = getPeriodDateRange();
        url += `&startDate=${range.start}&endDate=${range.end}`;
      }
      const res = await context.authFetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch report data");
      const json = await res.json();
      setReportData(json);
    } catch (err) {
      console.error(err);
      toast.error("Could not load reports and analytics. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadBookings = async () => {
    if (!context) return;
    setBookingsLoading(true);
    try {
      let url = `${API}/reports/bookings?period=${period}&page=${bookingsPage}&limit=${bookingsLimit}`;
      if (period === "custom") {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      } else if (period === "yearly" || period === "monthly") {
        const range = getPeriodDateRange();
        url += `&startDate=${range.start}&endDate=${range.end}`;
      }
      const res = await context.authFetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch report bookings");
      const json = await res.json();
      setBookingsData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [bookingsPage, period, startDate, endDate, selectedYear, selectedMonth]);

  const handleDownloadFinancial = async () => {
    if (!context) return;
    setDownloadingFinancial(true);
    try {
      let url = `${API}/reports/pdf/financial?period=${period}`;
      if (period === "custom") {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      } else if (period === "yearly" || period === "monthly") {
        const range = getPeriodDateRange();
        url += `&startDate=${range.start}&endDate=${range.end}`;
      }
      const response = await context.authFetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to download PDF report");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `financial_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Financial report PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download report PDF");
    } finally {
      setDownloadingFinancial(false);
    }
  };

  const handleDownloadBookings = async () => {
    if (!context) return;
    setDownloadingBookings(true);
    try {
      let url = `${API}/reports/pdf/bookings?period=${period}`;
      if (period === "custom") {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      } else if (period === "yearly" || period === "monthly") {
        const range = getPeriodDateRange();
        url += `&startDate=${range.start}&endDate=${range.end}`;
      }
      const response = await context.authFetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to download PDF report");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `bookings_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Bookings report PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download report PDF");
    } finally {
      setDownloadingBookings(false);
    }
  };

  const handleDownloadLocation = async () => {
    if (!context) return;
    setDownloadingLocation(true);
    try {
      let url = `${API}/reports/pdf/location?period=${period}`;
      if (period === "custom") {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      } else if (period === "yearly" || period === "monthly") {
        const range = getPeriodDateRange();
        url += `&startDate=${range.start}&endDate=${range.end}`;
      }
      const response = await context.authFetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to download PDF report");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `location_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Location report PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download report PDF");
    } finally {
      setDownloadingLocation(false);
    }
  };

  return {
    period,
    setPeriod,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    reportData,
    loading,
    refreshing,
    downloadingFinancial,
    downloadingBookings,
    downloadingLocation,
    loadStats,
    bookingsData,
    bookingsPage,
    setBookingsPage,
    bookingsLoading,
    handleDownloadFinancial,
    handleDownloadBookings,
    handleDownloadLocation,
    hasContext: !!context,
  };
}
