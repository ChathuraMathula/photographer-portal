export type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  access:
    | "Public"
    | "Super Admin Only"
    | "Super Admin & Admin"
    | "Super Admin & Photographer"
    | "Photographer Only"
    | "Super Admin, Admin & Photographer";
  category:
    | "Auth & Health"
    | "Public Bookings"
    | "Photographer Profile"
    | "Packages"
    | "Reservations"
    | "Payments"
    | "Reports"
    | "Invoices"
    | "Users";
  defaultQuery?: { key: string; value: string }[];
  defaultBody?: string;
};

export type SeedAccount = {
  role: string;
  email: string;
  pass: string;
  name: string;
};

export type SessionInfo = {
  email: string;
  role: string;
  name: string;
} | null;

export type QueryParam = {
  key: string;
  value: string;
};
