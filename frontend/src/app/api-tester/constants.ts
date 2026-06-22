import { Endpoint, SeedAccount } from "./types";

export const API = "http://localhost:4001";

// Mock/Seeded accounts for easy login
export const SEED_ACCOUNTS: SeedAccount[] = [
  { role: "SUPER_ADMIN", email: "admin@photoportal.com", pass: "SuperSecret123!", name: "System Admin" },
  { role: "ADMIN", email: "agency@photoportal.com", pass: "AdminSecret123!", name: "Agency Admin" },
  { role: "PHOTOGRAPHER", email: "sarah@photoportal.com", pass: "Photographer123!", name: "Sarah Johnson" },
  { role: "PHOTOGRAPHER", email: "michael@photoportal.com", pass: "Photographer123!", name: "Michael Fernando" }
];

export const ENDPOINTS: Endpoint[] = [
  // Auth & Health
  {
    method: "GET",
    path: "/health",
    description: "Fetch health status of the backend systems.",
    access: "Public",
    category: "Auth & Health"
  },
  {
    method: "POST",
    path: "/auth/login",
    description: "Authenticate user and set HTTP-only cookie access token.",
    access: "Public",
    category: "Auth & Health",
    defaultBody: JSON.stringify({ email: "sarah@photoportal.com", password: "Photographer123!" }, null, 2)
  },
  // Public Bookings
  {
    method: "GET",
    path: "/bookings/sarah-johnson",
    description: "Get public photographer bio, location, & specialties.",
    access: "Public",
    category: "Public Bookings"
  },
  {
    method: "GET",
    path: "/bookings/sarah-johnson/availability",
    description: "Check if a photographer slot is open for date and time range.",
    access: "Public",
    category: "Public Bookings",
    defaultQuery: [
      { key: "date", value: new Date().toISOString().split("T")[0] },
      { key: "startTime", value: "14:00" },
      { key: "endTime", value: "16:00" }
    ]
  },
  {
    method: "POST",
    path: "/bookings/sarah-johnson",
    description: "Submit a new booking request to a photographer.",
    access: "Public",
    category: "Public Bookings",
    defaultBody: JSON.stringify({
      firstName: "Ruwan",
      lastName: "Jayasekara",
      email: "ruwan@example.com",
      phone: "+94775556666",
      date: new Date().toISOString().split("T")[0],
      startTime: "14:00",
      endTime: "16:00",
      eventType: "Wedding Reception",
      location: "Galle Face Hotel",
      notes: "Looking forward to working together."
    }, null, 2)
  },
  {
    method: "POST",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE/verify",
    description: "Verify client email matches booking tracking token to grant page access.",
    access: "Public",
    category: "Public Bookings",
    defaultBody: JSON.stringify({ email: "priya@example.com" }, null, 2)
  },
  {
    method: "GET",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE",
    description: "Fetch status tracker detail card information.",
    access: "Public",
    category: "Public Bookings",
    defaultQuery: [{ key: "email", value: "priya@example.com" }]
  },
  {
    method: "GET",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE/messages",
    description: "Get message/chat negotiation logs.",
    access: "Public",
    category: "Public Bookings",
    defaultQuery: [{ key: "email", value: "priya@example.com" }]
  },
  {
    method: "POST",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE/messages",
    description: "Send chat reply message as customer.",
    access: "Public",
    category: "Public Bookings",
    defaultBody: JSON.stringify({
      email: "priya@example.com",
      content: "Hello! Can we schedule a quick call to align?"
    }, null, 2)
  },
  {
    method: "POST",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE/confirm",
    description: "Accept proposal package and pay simulated deposit.",
    access: "Public",
    category: "Public Bookings",
    defaultBody: JSON.stringify({
      email: "priya@example.com",
      packageId: "INSERT_PACKAGE_ID_HERE"
    }, null, 2)
  },
  // Photographer Profile
  {
    method: "GET",
    path: "/photographers",
    description: "List all registered photographer profiles in the portal.",
    access: "Super Admin Only",
    category: "Photographer Profile"
  },
  {
    method: "GET",
    path: "/photographers/INSERT_PHOTOGRAPHER_USER_ID_HERE",
    description: "Get specific profile configurations.",
    access: "Super Admin & Photographer",
    category: "Photographer Profile"
  },
  {
    method: "PATCH",
    path: "/photographers/INSERT_PHOTOGRAPHER_USER_ID_HERE/profile",
    description: "Update biography, location, & specialties.",
    access: "Super Admin & Photographer",
    category: "Photographer Profile",
    defaultBody: JSON.stringify({
      bio: "Updated professional wedding photographer portfolio.",
      baseLocation: "Negombo",
      specializations: ["Wedding", "Portrait", "Events"]
    }, null, 2)
  },
  {
    method: "PATCH",
    path: "/photographers/INSERT_PHOTOGRAPHER_USER_ID_HERE/toggle-availability",
    description: "Toggle whether photographer is accepting new client inquiries.",
    access: "Super Admin & Photographer",
    category: "Photographer Profile"
  },
  {
    method: "GET",
    path: "/photographers/INSERT_PHOTOGRAPHER_USER_ID_HERE/booking-link",
    description: "Retrieve generated booking url details.",
    access: "Super Admin Only",
    category: "Photographer Profile"
  },
  // Packages
  {
    method: "GET",
    path: "/packages",
    description: "List all standard packages templates owned by logged-in photographer.",
    access: "Photographer Only",
    category: "Packages"
  },
  {
    method: "POST",
    path: "/packages",
    description: "Create a standard pricing package proposal option.",
    access: "Photographer Only",
    category: "Packages",
    defaultBody: JSON.stringify({
      name: "Bronze Photography Option",
      description: "2 Hours covering and 25 edited digital photos.",
      price: 35000,
      durationHours: 2,
      includes: ["2 Hours Coverage", "25 Edited Photos", "USB Delivery"]
    }, null, 2)
  },
  {
    method: "PATCH",
    path: "/packages/INSERT_PACKAGE_ID_HERE",
    description: "Update package info and pricing details.",
    access: "Photographer Only",
    category: "Packages",
    defaultBody: JSON.stringify({
      name: "Bronze Option v2",
      price: 38000
    }, null, 2)
  },
  {
    method: "DELETE",
    path: "/packages/INSERT_PACKAGE_ID_HERE",
    description: "Permanently delete standard package template option.",
    access: "Photographer Only",
    category: "Packages"
  },
  // Reservations
  {
    method: "GET",
    path: "/reservations",
    description: "List active reservations. Photographers see only their own. Admins see all.",
    access: "Super Admin, Admin & Photographer",
    category: "Reservations"
  },
  {
    method: "POST",
    path: "/reservations",
    description: "Create an offline/manual reservation.",
    access: "Photographer Only",
    category: "Reservations",
    defaultBody: JSON.stringify({
      firstName: "Nimal",
      lastName: "Silva",
      email: "nimal@test.com",
      phone: "+94774443333",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "13:00",
      eventType: "Portrait",
      location: "Colombo 07",
      notes: "Manual reservation booked over phone call."
    }, null, 2)
  },
  {
    method: "GET",
    path: "/reservations/INSERT_RESERVATION_ID_HERE",
    description: "Get specific details for a reservation record.",
    access: "Super Admin, Admin & Photographer",
    category: "Reservations"
  },
  {
    method: "POST",
    path: "/reservations/INSERT_RESERVATION_ID_HERE/propose",
    description: "Submit package recommendation proposal and lock the slot for 24h.",
    access: "Photographer Only",
    category: "Reservations",
    defaultBody: JSON.stringify({
      packageIds: ["INSERT_PACKAGE_ID_1", "INSERT_PACKAGE_ID_2"],
      advancePaymentPriceInCents: 1500000,
      quotationNotes: "Highly recommend Bronze Option for your timeline."
    }, null, 2)
  },
  {
    method: "POST",
    path: "/reservations/INSERT_RESERVATION_ID_HERE/reject",
    description: "Reject incoming client booking request with context notes.",
    access: "Photographer Only",
    category: "Reservations",
    defaultBody: JSON.stringify({
      reason: "Sorry, I am fully booked on that date with an outstation shoot."
    }, null, 2)
  },
  {
    method: "GET",
    path: "/reservations/INSERT_RESERVATION_ID_HERE/messages",
    description: "Retrieve communication logs for reservation.",
    access: "Super Admin, Admin & Photographer",
    category: "Reservations"
  },
  {
    method: "POST",
    path: "/reservations/INSERT_RESERVATION_ID_HERE/messages",
    description: "Send chat negotiation message as photographer.",
    access: "Photographer Only",
    category: "Reservations",
    defaultBody: JSON.stringify({
      content: "Yes, we can definitely accommodate custom hours."
    }, null, 2)
  },
  // Users
  {
    method: "GET",
    path: "/users",
    description: "List portal user accounts.",
    access: "Super Admin & Admin",
    category: "Users"
  },
  {
    method: "POST",
    path: "/users",
    description: "Create system user account (Admin or Photographer).",
    access: "Super Admin & Admin",
    category: "Users",
    defaultBody: JSON.stringify({
      firstName: "Kamal",
      lastName: "Perera",
      email: "kamal@photoportal.com",
      password: "Photographer123!",
      role: "PHOTOGRAPHER",
      phone: "+94777777777",
      bookingSlug: "kamal-perera",
      baseLocation: "Colombo",
      bio: "Commercial food and product photographer."
    }, null, 2)
  },
  {
    method: "PATCH",
    path: "/users/INSERT_USER_ID_HERE/toggle-active",
    description: "Toggle active state (suspend/activate) of user account.",
    access: "Super Admin & Admin",
    category: "Users"
  }
];
