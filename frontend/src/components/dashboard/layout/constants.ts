import { CalendarCheck, CalendarDays, Layers, User, CreditCard, BarChart3, Receipt } from "lucide-react";
import React from "react";

export type MenuItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

export const PHOTOGRAPHER_MENU: MenuItem[] = [
  { id: "reservations", label: "Reservations", icon: CalendarCheck },
  { id: "calendar",     label: "Calendar",     icon: CalendarDays },
  { id: "packages",     label: "Packages",     icon: Layers },
  { id: "transactions", label: "Transactions", icon: CreditCard },
  { id: "reports",      label: "Reports & Analytics", icon: BarChart3 },
  { id: "invoices",     label: "Invoices",     icon: Receipt },
  { id: "profile",      label: "My Profile",   icon: User },
];
