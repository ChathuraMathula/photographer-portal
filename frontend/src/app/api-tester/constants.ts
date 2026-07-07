import { Endpoint, SeedAccount } from "./types";

export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

// Mock/Seeded accounts for easy login
export const SEED_ACCOUNTS: SeedAccount[] = [
  {
    role: "SUPER_ADMIN",
    email: "admin@photoportal.com",
    pass: "SuperSecret123!",
    name: "System Admin",
  },
  {
    role: "ADMIN",
    email: "agency@photoportal.com",
    pass: "AdminSecret123!",
    name: "Agency Admin",
  },
  {
    role: "PHOTOGRAPHER",
    email: "sarah@photoportal.com",
    pass: "Photographer123!",
    name: "Sarah Johnson",
  },
  {
    role: "PHOTOGRAPHER",
    email: "michael@photoportal.com",
    pass: "Photographer123!",
    name: "Michael Fernando",
  },
];

export const CATEGORIES = [
  "Auth & Health",
  "Public Bookings",
  "Photographer Profile",
  "Packages",
  "Reservations",
  "Payments",
  "Reports",
  "Invoices",
  "Users",
] as const;

export const ENDPOINTS: Endpoint[] = [
  // ── Auth & Health ────────────────────────────────────────────────────────────
  {
    method: "GET",
    path: "/health",
    description:
      "Fetch health status of the backend systems (database + server).",
    access: "Public",
    category: "Auth & Health",
  },
  {
    method: "POST",
    path: "/auth/login",
    description: "Authenticate user and set HTTP-only cookie access token.",
    access: "Public",
    category: "Auth & Health",
    defaultBody: JSON.stringify(
      { email: "sarah@photoportal.com", password: "Photographer123!" },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/auth/logout",
    description: "Clear the HTTP-only auth cookie and invalidate the session.",
    access: "Public",
    category: "Auth & Health",
  },

  // ── Public Bookings ──────────────────────────────────────────────────────────
  {
    method: "GET",
    path: "/bookings/sarah-johnson",
    description:
      "Get public photographer bio, location, & specialties for the booking page.",
    access: "Public",
    category: "Public Bookings",
  },
  {
    method: "GET",
    path: "/bookings/sarah-johnson/availability",
    description:
      "Check if a photographer slot is open for a given date and time range.",
    access: "Public",
    category: "Public Bookings",
    defaultQuery: [
      { key: "date", value: new Date().toISOString().split("T")[0] },
      { key: "startTime", value: "14:00" },
      { key: "endTime", value: "16:00" },
    ],
  },
  {
    method: "POST",
    path: "/bookings/sarah-johnson",
    description: "Submit a new booking inquiry to a photographer.",
    access: "Public",
    category: "Public Bookings",
    defaultBody: JSON.stringify(
      {
        firstName: "Ruwan",
        lastName: "Jayasekara",
        email: "ruwan@example.com",
        phone: "+94775556666",
        date: new Date().toISOString().split("T")[0],
        startTime: "14:00",
        endTime: "16:00",
        eventType: "Wedding Reception",
        location: "Galle Face Hotel",
        notes: "Looking forward to working together.",
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE/verify",
    description:
      "Verify client email against the booking tracking token to grant tracking page access.",
    access: "Public",
    category: "Public Bookings",
    defaultBody: JSON.stringify({ email: "priya@example.com" }, null, 2),
  },
  {
    method: "GET",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE",
    description: "Fetch status tracker detail card information for a customer.",
    access: "Public",
    category: "Public Bookings",
    defaultQuery: [{ key: "email", value: "priya@example.com" }],
  },
  {
    method: "GET",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE/messages",
    description:
      "Get message/chat negotiation logs for the customer tracking view.",
    access: "Public",
    category: "Public Bookings",
    defaultQuery: [{ key: "email", value: "priya@example.com" }],
  },
  {
    method: "POST",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE/messages",
    description:
      "Send a chat reply message as the customer from the tracking page.",
    access: "Public",
    category: "Public Bookings",
    defaultBody: JSON.stringify(
      {
        email: "priya@example.com",
        content: "Hello! Can we schedule a quick call to align?",
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE/confirm",
    description: "Accept a package proposal and process the deposit payment.",
    access: "Public",
    category: "Public Bookings",
    defaultBody: JSON.stringify(
      {
        email: "priya@example.com",
        packageId: "INSERT_PACKAGE_ID_HERE",
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE/cancel",
    description: "Cancel a booking from the customer-facing tracking page.",
    access: "Public",
    category: "Public Bookings",
    defaultBody: JSON.stringify({ email: "priya@example.com" }, null, 2),
  },

  // ── Photographer Profile ─────────────────────────────────────────────────────
  {
    method: "GET",
    path: "/photographers",
    description: "List all registered photographer profiles in the portal.",
    access: "Super Admin Only",
    category: "Photographer Profile",
  },
  {
    method: "GET",
    path: "/photographers/INSERT_PHOTOGRAPHER_USER_ID_HERE",
    description: "Get specific profile configurations for a photographer.",
    access: "Super Admin & Photographer",
    category: "Photographer Profile",
  },
  {
    method: "PATCH",
    path: "/photographers/INSERT_PHOTOGRAPHER_USER_ID_HERE/profile",
    description: "Update biography, base location, & specializations.",
    access: "Super Admin & Photographer",
    category: "Photographer Profile",
    defaultBody: JSON.stringify(
      {
        bio: "Updated professional wedding photographer portfolio.",
        baseLocation: "Negombo",
        specializations: ["Wedding", "Portrait", "Events"],
      },
      null,
      2,
    ),
  },
  {
    method: "PATCH",
    path: "/photographers/INSERT_PHOTOGRAPHER_USER_ID_HERE/toggle-availability",
    description:
      "Toggle whether the photographer is accepting new client inquiries.",
    access: "Super Admin & Photographer",
    category: "Photographer Profile",
  },
  {
    method: "GET",
    path: "/photographers/INSERT_PHOTOGRAPHER_USER_ID_HERE/booking-link",
    description:
      "Retrieve the generated booking URL slug details for a photographer.",
    access: "Super Admin Only",
    category: "Photographer Profile",
  },

  // ── Packages ─────────────────────────────────────────────────────────────────
  {
    method: "GET",
    path: "/packages",
    description:
      "List all pricing package templates owned by the logged-in photographer.",
    access: "Photographer Only",
    category: "Packages",
  },
  {
    method: "POST",
    path: "/packages",
    description: "Create a new standard pricing package template.",
    access: "Photographer Only",
    category: "Packages",
    defaultBody: JSON.stringify(
      {
        name: "Bronze Photography Option",
        description: "2 Hours covering and 25 edited digital photos.",
        price: 35000,
        durationHours: 2,
        includes: ["2 Hours Coverage", "25 Edited Photos", "USB Delivery"],
      },
      null,
      2,
    ),
  },
  {
    method: "PATCH",
    path: "/packages/INSERT_PACKAGE_ID_HERE",
    description: "Update package name, description, price, or includes.",
    access: "Photographer Only",
    category: "Packages",
    defaultBody: JSON.stringify(
      {
        name: "Bronze Option v2",
        price: 38000,
      },
      null,
      2,
    ),
  },
  {
    method: "DELETE",
    path: "/packages/INSERT_PACKAGE_ID_HERE",
    description: "Permanently delete a package template.",
    access: "Photographer Only",
    category: "Packages",
  },

  // ── Reservations ─────────────────────────────────────────────────────────────
  {
    method: "GET",
    path: "/reservations",
    description:
      "List active reservations. Photographers see only their own; Admins see all.",
    access: "Super Admin, Admin & Photographer",
    category: "Reservations",
  },
  {
    method: "POST",
    path: "/reservations",
    description:
      "Manually create an offline reservation (e.g. booked over the phone).",
    access: "Photographer Only",
    category: "Reservations",
    defaultBody: JSON.stringify(
      {
        firstName: "Nimal",
        lastName: "Silva",
        email: "nimal@test.com",
        phone: "+94774443333",
        date: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "13:00",
        eventType: "Portrait",
        location: "Colombo 07",
        notes: "Manual reservation booked over phone call.",
      },
      null,
      2,
    ),
  },
  {
    method: "GET",
    path: "/reservations/INSERT_RESERVATION_ID_HERE",
    description: "Get full details for a specific reservation record.",
    access: "Super Admin, Admin & Photographer",
    category: "Reservations",
  },
  {
    method: "POST",
    path: "/reservations/INSERT_RESERVATION_ID_HERE/propose",
    description:
      "Submit a package proposal to the customer and lock the slot for 24 hours.",
    access: "Photographer Only",
    category: "Reservations",
    defaultBody: JSON.stringify(
      {
        packageIds: ["INSERT_PACKAGE_ID_1", "INSERT_PACKAGE_ID_2"],
        advancePaymentPriceInCents: 1500000,
        quotationNotes: "Highly recommend Bronze Option for your timeline.",
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/reservations/INSERT_RESERVATION_ID_HERE/reject",
    description: "Reject an incoming booking request with an optional reason.",
    access: "Photographer Only",
    category: "Reservations",
    defaultBody: JSON.stringify(
      {
        reason:
          "Sorry, I am fully booked on that date with an outstation shoot.",
      },
      null,
      2,
    ),
  },
  {
    method: "GET",
    path: "/reservations/INSERT_RESERVATION_ID_HERE/messages",
    description: "Retrieve the negotiation chat log for a reservation.",
    access: "Super Admin, Admin & Photographer",
    category: "Reservations",
  },
  {
    method: "POST",
    path: "/reservations/INSERT_RESERVATION_ID_HERE/messages",
    description:
      "Send a negotiation message to the customer as the photographer.",
    access: "Photographer Only",
    category: "Reservations",
    defaultBody: JSON.stringify(
      {
        content: "Yes, we can definitely accommodate custom hours.",
      },
      null,
      2,
    ),
  },

  // ── Payments ─────────────────────────────────────────────────────────────────
  {
    method: "POST",
    path: "/payments/charge",
    description:
      "Process a payment charge (sandbox). Used by the tracking page deposit/balance flow.",
    access: "Public",
    category: "Payments",
    defaultBody: JSON.stringify(
      {
        reservationId: "INSERT_RESERVATION_ID_HERE",
        email: "customer@example.com",
        amount: 1500000,
        type: "ADVANCE",
        cardNumber: "4111111111111111",
        expiryMonth: "12",
        expiryYear: "2026",
        cvv: "123",
        cardholderName: "Ruwan Jayasekara",
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/payments/INSERT_RESERVATION_ID_HERE/manual-fulfill",
    description:
      "Manually mark a confirmed reservation's full payment as fulfilled (cash in hand).",
    access: "Photographer Only",
    category: "Payments",
  },
  {
    method: "GET",
    path: "/payments/photographer",
    description:
      "Retrieve all payment transaction records for the logged-in photographer.",
    access: "Photographer Only",
    category: "Payments",
  },
  {
    method: "GET",
    path: "/payments/INSERT_RESERVATION_ID_HERE",
    description: "Get all payments linked to a specific reservation.",
    access: "Photographer Only",
    category: "Payments",
  },

  // ── Reports ──────────────────────────────────────────────────────────────────
  {
    method: "GET",
    path: "/reports/data",
    description:
      "Fetch aggregated report data (revenue, bookings, charts) for a given period. Super Admins & Admins get system-wide metrics unless a photographerId query is passed.",
    access: "Super Admin, Admin & Photographer",
    category: "Reports",
    defaultQuery: [{ key: "period", value: "monthly" }],
  },
  {
    method: "GET",
    path: "/reports/pdf/financial",
    description:
      "Download the Financial Analytics PDF report as an attachment for the selected period.",
    access: "Super Admin, Admin & Photographer",
    category: "Reports",
    defaultQuery: [{ key: "period", value: "monthly" }],
  },
  {
    method: "GET",
    path: "/reports/pdf/bookings",
    description:
      "Download the Bookings Analytics PDF report as an attachment for the selected period.",
    access: "Super Admin, Admin & Photographer",
    category: "Reports",
    defaultQuery: [{ key: "period", value: "monthly" }],
  },

  // ── Invoices ─────────────────────────────────────────────────────────────────
  {
    method: "GET",
    path: "/invoices",
    description:
      "List all invoices for the logged-in photographer across all completed reservations.",
    access: "Photographer Only",
    category: "Invoices",
  },
  {
    method: "GET",
    path: "/invoices/settings",
    description:
      "Retrieve the photographer's invoice customization settings (logo, colors, notes).",
    access: "Photographer Only",
    category: "Invoices",
  },
  {
    method: "PATCH",
    path: "/invoices/settings",
    description:
      "Update invoice customization settings (business name, logo, accent color, footer notes).",
    access: "Photographer Only",
    category: "Invoices",
    defaultBody: JSON.stringify(
      {
        businessName: "Sarah Johnson Photography",
        accentColor: "#0e2d5c",
        footerNotes: "Thank you for choosing us for your special moments.",
        showLogo: true,
      },
      null,
      2,
    ),
  },
  {
    method: "GET",
    path: "/invoices/INSERT_RESERVATION_ID_HERE/download",
    description:
      "Download the PDF invoice for a specific completed reservation.",
    access: "Photographer Only",
    category: "Invoices",
  },
  {
    method: "GET",
    path: "/invoices/public/INSERT_TRACKING_TOKEN_HERE/download",
    description:
      "Public endpoint for customers to download their invoice via tracking token (no auth required).",
    access: "Public",
    category: "Invoices",
  },
  {
    method: "POST",
    path: "/invoices/INSERT_RESERVATION_ID_HERE/resend",
    description: "Resend the PDF invoice to the customer's email address.",
    access: "Photographer Only",
    category: "Invoices",
  },

  // ── Users ────────────────────────────────────────────────────────────────────
  {
    method: "GET",
    path: "/users/me",
    description: "Retrieve the authenticated user's profile information.",
    access: "Super Admin, Admin & Photographer",
    category: "Users",
  },
  {
    method: "PATCH",
    path: "/users/me",
    description:
      "Update the authenticated user's profile details (first name, last name, phone, and password).",
    access: "Super Admin, Admin & Photographer",
    category: "Users",
    defaultBody: JSON.stringify(
      {
        firstName: "Kamal",
        lastName: "Perera",
        phone: "+94777777777",
        password: "NewSecurePassword123!",
      },
      null,
      2,
    ),
  },
  {
    method: "GET",
    path: "/users",
    description: "List portal user accounts (Admins and Photographers).",
    access: "Super Admin & Admin",
    category: "Users",
  },
  {
    method: "POST",
    path: "/users",
    description:
      "Create a new system user account (Admin or Photographer role).",
    access: "Super Admin & Admin",
    category: "Users",
    defaultBody: JSON.stringify(
      {
        firstName: "Kamal",
        lastName: "Perera",
        email: "kamal@photoportal.com",
        password: "Photographer123!",
        role: "PHOTOGRAPHER",
        phone: "+94777777777",
        bookingSlug: "kamal-perera",
        baseLocation: "Colombo",
        bio: "Commercial food and product photographer.",
      },
      null,
      2,
    ),
  },
  {
    method: "PATCH",
    path: "/users/INSERT_USER_ID_HERE/toggle-active",
    description:
      "Toggle the active state (suspend or re-activate) of a user account.",
    access: "Super Admin & Admin",
    category: "Users",
  },
];
