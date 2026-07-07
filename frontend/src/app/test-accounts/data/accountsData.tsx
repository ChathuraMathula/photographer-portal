import React from "react";
import { Shield, ShieldAlert, Camera } from "lucide-react";
import { type Account } from "../components/AccountRow";

export const testAccounts: Account[] = [
  {
    role: "Super Admin",
    name: "System Admin",
    email: "admin@photoportal.com",
    password: "SuperSecret123!",
    description:
      "Full platform permissions: manages all users, settings, and views aggregated business reports.",
    icon: <ShieldAlert className="h-5 w-5" />,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600 dark:text-red-400",
  },
  {
    role: "Standard Admin",
    name: "Agency Admin",
    email: "agency@photoportal.com",
    password: "AdminSecret123!",
    description:
      "Agency level access: can manage photographers, view reports, but cannot delete Super Admins.",
    icon: <Shield className="h-5 w-5" />,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    role: "Photographer 1",
    name: "Sarah Johnson",
    email: "sarah@photoportal.com",
    password: "Photographer123!",
    description:
      "Sarah's account: features pre-populated booking requests, financial timelines, packages, and calendar entries.",
    icon: <Camera className="h-5 w-5" />,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    role: "Photographer 2",
    name: "Michael Fernando",
    email: "michael@photoportal.com",
    password: "Photographer123!",
    description:
      "Michael's account: features corporate event bookings, customized package offerings, and offline settings.",
    icon: <Camera className="h-5 w-5" />,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
];
