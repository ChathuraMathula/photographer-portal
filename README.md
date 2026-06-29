# Photographer Portal

A reservation management system for photographers. Super Admins manage photographer accounts and generate shareable booking links. Customers use those links to check availability and submit reservation requests — no account required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeScript |
| Frontend | Next.js 16 (App Router), React 19 |
| Database | PostgreSQL 16 (via TypeORM) |
| Auth | JWT (cookie-based), Passport |
| UI | shadcn/ui, Tailwind CSS 4 |
| Forms | Formik + Yup |
| State | Redux Toolkit |
| Infrastructure | Docker + Docker Compose |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/)
- npm 10+

---

## Project Structure

```
photographer-portal/
├── docker-compose.yml       # PostgreSQL + pgAdmin + Maildev
├── backend/                 # NestJS API (port 4001)
│   ├── src/
│   │   ├── auth/            # JWT auth, guards, strategies
│   │   ├── bookings/        # Public booking flow (no auth)
│   │   ├── audit-logs/      # [NEW] System-wide action audit log tracking
│   │   ├── photographers/   # Photographer profile management
│   │   ├── reservations/    # Reservation management (protected)
│   │   ├── users/           # User / photographer account creation
│   │   ├── entities/        # TypeORM entity schemas
│   │   ├── migrations/      # DB Schema migrations
│   │   ├── database/        # DatabaseModule configurations
│   │   ├── scripts/         # seed-data.ts (shared seed logic)
│   │   ├── seed.ts          # npm run seed entry point
│   │   └── reset.ts         # npm run db:reset entry point
│   └── package.json
└── frontend/                # Next.js App Router (port 4000)
     └── src/
          ├── app/
          │   ├── login/       # Login page
          │   ├── test-accounts/ # [NEW] TestAccountsPage credentials directory
          │   ├── forgot-password/ # [NEW] ForgotPasswordPage component
          │   ├── reset-password/  # [NEW] ResetPasswordPage component
          │   ├── dashboard/   # Role-based collapsible dashboard
          │   │   ├── reports/
          │   │   │   ├── hooks/
          │   │   │   │   └── useReports.ts # Custom hook managing statistics & reports state
          │   │   │   ├── components/
          │   │   │   │   ├── PhotographerAnalyticsCharts.tsx      # Encapsulates revenue & status charts
          │   │   │   │   └── PhotographerPerformanceBreakdown.tsx # Encapsulates package & bookings lists
          │   │   │   ├── utils/
          │   │   │   │   └── locationUtils.ts # [NEW] Pure functions: coord extraction, district/city/map-point aggregation
          │   │   │   └── ...
          │   │   ├── settings/    # User settings page (notifications preference switches)
          │   │   └── audit-logs/  # Super Admin audit logs viewer dashboard
          │   ├── api-tester/  # Interactive developer API Docs & Tester Console
          │   └── book/[slug]/ # Public booking page
          ├── components/
          │   ├── common/
          │   │   ├── OSMMapPreview.tsx # Clean, sandboxed OpenStreetMap Leaflet preview component
          │   │   └── OSMMapPicker.tsx  # Interactive OpenStreetMap coordinate pin selector
          │   ├── dashboard/
          │   │   ├── profile/ # AdminProfilePage.tsx - Admin profile configuration
          │   │   ├── reports/ 
          │   │   │   ├── AdminReportsPage.tsx         # Admin analytics dashboard with graphs
          │   │   │   ├── PhotographerReportsView.tsx  # Photographer reports visualization component
          │   │   │   ├── LocationAnalyticsMap.tsx     # Legacy OpenStreetMap heatmap (kept for backward compat)
          │   │   │   └── location/                   # [NEW] Modular location analytics components
          │   │   │       ├── LocationAnalyticsSection.tsx   # [NEW] Orchestrator: renders all location analytics panels
          │   │   │       ├── LocationInsightsCard.tsx       # [NEW] KPI summary: top district/city, coord coverage %
          │   │   │       ├── DistrictBookingsBar.tsx        # [NEW] Segmented horizontal bar chart per district
          │   │   │       ├── CityBookingsRank.tsx           # [NEW] Ranked list of top cities with booking counts
          │   │   │       ├── EventTypeByDistrictChart.tsx   # [NEW] Stacked bar of event types across districts
          │   │   │       └── EnhancedLocationMap.tsx        # [NEW] Leaflet OSM map: clustered colour-coded markers
          │   │   └── ...
          ├── config/routes.ts # Route permissions + prefixes
          ├── proxy.ts         # Next.js middleware (auth guard)
          └── store/           # Redux store + authSlice
```

---

## Getting Started

### 1. Start the services

```bash
docker compose up -d
```

This starts:
- **PostgreSQL 16** on `localhost:5433`
- **pgAdmin 4** (DB UI) on `http://localhost:5050`
- **Maildev** (Local SMTP Web UI) on `http://localhost:1080` (SMTP port `1025`)

### pgAdmin Login & Database Connection

To access and manage the database via the pgAdmin web UI:

1. Open **pgAdmin 4** at [http://localhost:5050](http://localhost:5050)
2. Log in with the pgAdmin credentials:
   - **Email/Username**: `admin@photoportal.com`
   - **Password**: `pgadminsecure123`
3. Register/Connect to the PostgreSQL server:
   - Right-click **Servers** in the left browser tree > **Register** > **Server...**
   - Under the **General** tab:
     - **Name**: `Photographer Portal`
   - Under the **Connection** tab:
     - **Host name/address**: `postgres` *(the Docker service name)*
     - **Port**: `5432` *(internal Docker port, NOT 5433)*
     - **Maintenance database**: `portal`
     - **Username**: `admin`
     - **Password**: `securepassword123`
     - Check **Save password?**
   - Click **Save**.

### Navigating the Database & Generating ERDs

Once connected to the server in pgAdmin, navigate the sidebar tree to view your tables, data, and entity diagrams:

* **View Tables**:
  1. Expand **Servers** > **Photographer Portal** *(or your custom server name)*.
  2. Expand **Databases** > **portal**.
  3. Expand **Schemas** > **public**.
  4. Expand **Tables** to see all tables (e.g., `users`, `reservations`, `photographer_profiles`, etc.).
* **View Table Data**:
  * Right-click any table (e.g., `users`) > **View/Edit Data** > **All Rows** (or use the Query Tool and run `SELECT * FROM table_name;`).
* **Generate Entity Relationship Diagram (ERD)**:
  * Right-click the **portal** database name > select **ERD Tool**. This opens pgAdmin's automatic schema visualizer showing table keys, columns, types, and relations.

### 2. Configure environment variables

#### Backend configurations
Create `backend/.env`:

```env
PORT=4001
FRONTEND_URL=http://localhost:4000

# Database configurations
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=admin
DB_PASSWORD=securepassword123
DB_DATABASE=portal

# Authentication configs
JWT_SECRET=SUPER_SECRET_KEY_CHANGE_ME
```

#### Frontend configurations
Create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
```

### 3. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Seed the database

```bash
cd backend
npm run seed
```

This creates:
- 1 Super Admin: `admin@photoportal.com` / `SuperSecret123!`
- 1 Agency Admin: `agency@photoportal.com` / `AdminSecret123!`
- 2 Photographers: Sarah Johnson (`sarah@photoportal.com`) and Michael Fernando (`michael@photoportal.com`) with password `Photographer123!`
- Sample customers, packages, messages, and reservations

### 5. Start the servers

```bash
# Backend (port 4001)
cd backend && npm run start:dev

# Frontend (port 4000) — in a separate terminal
cd frontend && npm run dev
```

---

## Usage

### Admin login

Open `http://localhost:4000/login`

| Field | Value |
|---|---|
| Email | `admin@photoportal.com` |
| Password | `SuperSecret123!` |

### Customer booking flow

Each photographer has a unique shareable link:

```
http://localhost:4000/book/<booking-slug>
```

Seeded examples:
- `http://localhost:4000/book/sarah-johnson`
- `http://localhost:4000/book/michael-fernando`

The booking flow has three steps:
1. **Check availability** — pick a date, time range, and event type
2. **Your details** — name, email, phone, optional venue and notes
3. **Confirmation** — displays a tracking URL to check reservation status

Customers do not need an account.

---

## API Reference

### Auth & Health

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Fetch health status of the backend systems. |
| `POST` | `/auth/login` | Public | Authenticate user and set HTTP-only cookie access token. |

### Public Bookings (No Auth)

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/bookings/:slug` | Public | Get public photographer bio, location, & specialties. |
| `GET` | `/bookings/:slug/availability` | Public | Check if a photographer slot is open for date and time range. |
| `POST` | `/bookings/:slug` | Public | Submit a new booking request to a photographer. |
| `POST` | `/bookings/track/:token/verify` | Public | Verify client email matches booking tracking token. |
| `GET` | `/bookings/track/:token` | Public | Fetch status tracker detail card information. |
| `GET` | `/bookings/track/:token/messages` | Public | Get message/chat negotiation logs. |
| `POST` | `/bookings/track/:token/messages` | Public | Send chat reply message as customer. |
| `POST` | `/bookings/track/:token/confirm` | Public | Accept proposal package and pay simulated deposit. |

### Photographer Profiles

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/photographers` | Super Admin Only | List all registered photographer profiles. |
| `GET` | `/photographers/:id` | Super Admin & Photographer | Get specific profile configurations. |
| `PATCH` | `/photographers/:id/profile` | Super Admin & Photographer | Update biography, location, & specialties. |
| `PATCH` | `/photographers/:id/toggle-availability` | Super Admin & Photographer | Toggle whether photographer is accepting new inquiries. |
| `GET` | `/photographers/:id/booking-link` | Super Admin Only | Retrieve generated booking url details. |

### Packages

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/packages` | Photographer Only | List standard packages owned by logged-in photographer. |
| `POST` | `/packages` | Photographer Only | Create a standard pricing package proposal option. |
| `PATCH` | `/packages/:id` | Photographer Only | Update package info and pricing details. |
| `DELETE` | `/packages/:id` | Photographer Only | Permanently delete standard package template option. |

### Reservations

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/reservations` | Super Admin, Admin & Photographer | List active reservations (scoped by role). |
| `POST` | `/reservations` | Photographer Only | Create an offline/manual reservation. |
| `GET` | `/reservations/:id` | Super Admin, Admin & Photographer | Get specific details for a reservation record. |
| `POST` | `/reservations/:id/propose` | Photographer Only | Submit package recommendation proposal and lock slot. |
| `POST` | `/reservations/:id/reject` | Photographer Only | Reject incoming client booking request with notes. |
| `GET` | `/reservations/:id/messages` | Super Admin, Admin & Photographer | Retrieve communication logs for reservation. |
| `POST` | `/reservations/:id/messages` | Photographer Only | Send chat negotiation message as photographer. |

### Users

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/users` | Super Admin & Admin | List portal user accounts. |
| `POST` | `/users` | Super Admin & Admin | Create system user account (Admin or Photographer). |
| `PATCH` | `/users/:id/toggle-active` | Super Admin & Admin | Toggle active state of user account. |

---

## API Documentation & Tester Console

For testing API endpoints, use the interactive panel built directly into the frontend:
- **URL**: `http://localhost:4000/api-tester`
- **Features**:
  - Displays endpoint metadata, HTTP methods, and required roles.
  - Interactive playground allowing query parameter manipulation and request body configurations.
  - Quick-login buttons simulating admin and photographer authentication via session cookies.
  - Formatted JSON response viewers displaying latency metrics, statuses, and headers.

---

## Database Scripts

Run from the `backend/` directory:

```bash
# Seed with sample data (idempotent — safe to run multiple times)
npm run seed

# Drop the database and re-seed from scratch
npm run db:reset
```

---

## Database Schema

### `users`
Auth records for Admins and Photographers only. Customers never log in.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (string) | primary key |
| `firstName` | String | |
| `lastName` | String | |
| `email` | String | unique |
| `passwordHash` | String | bcrypt |
| `role` | Enum | `SUPER_ADMIN` \| `ADMIN` \| `PHOTOGRAPHER` |
| `isActive` | Boolean | default `true` |
| `phone` | String | optional |

### `photographer_profiles`
Public-facing profile, 1-to-1 with a User of role `PHOTOGRAPHER`.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (string) | primary key |
| `userId` | UUID (string) | foreign key: User |
| `bookingSlug` | String | unique, URL-safe (e.g. `sarah-johnson`) |
| `bio` | String | optional |
| `specializations` | String[] | e.g. `["Wedding", "Portrait"]` |
| `portfolioUrl` | String | optional |
| `baseLocation` | String | optional |
| `isAvailableForBooking` | Boolean | default `true` |

### `customers`
Created automatically on first booking. No passwords.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (string) | primary key |
| `firstName` | String | |
| `lastName` | String | |
| `email` | String | unique |
| `phone` | String | |
| `address` | String | optional |
| `notes` | String | optional |

### `reservations`
Tracks client requests, proposal statuses, and advance deposit payments.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (string) | primary key |
| `customerId` | UUID (string) | foreign key: Customer |
| `photographerId` | UUID (string) | foreign key: User |
| `date` | Date | |
| `startTime` | String | `HH:MM` 24-hour format |
| `endTime` | String | `HH:MM` 24-hour format |
| `eventType` | String | e.g. `Wedding` |
| `location` | String | optional |
| `customerNotes` | String | optional |
| `adminNotes` | String | internal only |
| `totalAmountInCents` | Number | internal only, integer cents |
| `advancePaymentPriceInCents` | Number | deposit required |
| `status` | Enum | `PENDING` \| `PROPOSED` \| `REJECTED` \| `CONFIRMED` \| `CANCELLED` \| `COMPLETED` |
| `reservationToken` | String | unique, used for customer tracking URL |
| `paymentDeadline` | Timestamp | time limit to accept proposal / pay deposit |

### `packages`
Pricing references and templates. Owned by photographer.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (string) | primary key |
| `photographerId` | UUID (string) | foreign key: User |
| `name` | String | |
| `description` | String | optional |
| `price` | Number | price in rupees |
| `durationHours` | Number | |
| `includes` | String[] | |
| `isActive` | Boolean | default `true` |

### `messages`
Simulates custom portal chat logs between photographers and customer trackers.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (string) | primary key |
| `reservationId` | UUID (string) | foreign key: Reservation |
| `sender` | String | `CUSTOMER` \| `PHOTOGRAPHER` |
| `content` | String | chat message text |

---

## Sandbox Payment Gateway & Sri Lankan Card Testing

The portal implements a secure, sandbox-powered advanced deposit flow. When a photographer proposes a quotation, the customer is required to make an advanced payment within **24 hours** to lock their reservation. 

### Package-Specific Deposits
Rather than a single flat fee, the checkout deposit amount is dynamically calculated based on the photographer's package deposit policy:
- **Fixed**: A set amount in LKR (e.g. LKR 5,000).
- **Percentage**: A percentage of the package total (e.g. 20% of LKR 25,000).
- **Universal**: Falls back to the photographer's default profile settings.

### Sri Lankan Bank Cards Simulation
To simulate local card transactions, you can test with card numbers matching specific Sri Lankan bank BIN ranges. When matched, the system dynamically identifies and records the bank and card brand:

| Bank / Card Issuer | Card Brand | Test Card Number | Simulation Outcome |
|---|---|---|---|
| **Sampath Bank** | Visa | `4532 8511 2233 4455` | **Success** (Recorded as Sampath Bank (Visa)) |
| **Commercial Bank** | Mastercard | `5254 9622 3344 5566` | **Success** (Recorded as Commercial Bank (Mastercard)) |
| **Bank of Ceylon (BOC)** | Visa | `4005 8611 2233 4455` | **Success** (Recorded as Bank of Ceylon (Visa)) |
| **Standard Sandbox Card** | Visa | `4242 4242 4242 4242` | **Success** (Recorded as Visa Sandbox) |
| **Declined: Insufficient Funds** | Visa | `4000 0000 0000 0002` | **Decline** (`Card Declined: Insufficient Funds`) |
| **Declined: Card Expired** | Visa | `4000 0000 0000 0005` | **Decline** (`Card Declined: Card Expired`) |
| **Declined: Suspected Fraud** | Visa | `4000 0000 0000 0008` | **Decline** (`Card Declined: Suspected Fraud`) |
| **Gateway Timeout** | Mastercard | `5555 5555 5555 5555` | **Fail** (Simulates 2s lag, returns gateway timeout) |

*Note: Cardholder Name, Expiry Date (MM/YY), and CVV (3 digits) are required inputs. Any other valid 16-digit card will process as a generic success.*

### Manual Offline Payments
When registering a manual offline booking from the photographer's dashboard, the photographer can select a package to auto-fill pricing or enter the total amount and advance paid in cash. This automatically creates an offline payment log record (Cash / Offline Payment) on the backend and updates the booking to `CONFIRMED`.

### Developer Transactions Log
All transactions (simulated card payments and manual cash entries) can be monitored by the photographer in real-time under the **Transactions** navigation tab in the dashboard.

---

## Stopping Docker

```bash
docker compose down
```

Data is persisted in `./postgres-data/` and survives restarts. To wipe the data volume:

```bash
docker compose down -v
rm -rf ./postgres-data
```

---

## Location Analytics in Reports & Analytics

The **Reports & Analytics** page includes a comprehensive **Location Analytics** panel available to both Photographers and Admins. It is powered by OpenStreetMap (via Leaflet) and operates entirely from the `rawBookings` data already returned by `GET /reports/data` — no additional API calls are made.

### Architecture: Modular Components

All location analytics components live under `frontend/src/components/dashboard/reports/location/`:

| Component | Responsibility |
|---|---|
| `LocationAnalyticsSection.tsx` | **Orchestrator** — computes all derived shapes from `rawBookings` via `useMemo` and renders the full panel |
| `LocationInsightsCard.tsx` | Four KPI tiles: top district, top city, bookings with exact coordinates, location coverage % |
| `DistrictBookingsBar.tsx` | Horizontal **segmented bar chart** (top 10 districts) — each segment coloured by event type |
| `CityBookingsRank.tsx` | **Ranked list** of top 8 cities with colour-coded rank badges and mini progress bars |
| `EventTypeByDistrictChart.tsx` | **Stacked horizontal bar chart** showing how event types are distributed across districts |
| `EnhancedLocationMap.tsx` | **Interactive Leaflet OSM map** with clustered, colour-coded markers per event type |

### Utility File

`frontend/src/app/dashboard/reports/utils/locationUtils.ts` exports pure (side-effect-free) functions:

| Function | Purpose |
|---|---|
| `extractCoordsFromMapLink(url)` | Parses `@lat,lon` or `?q=lat,lon` patterns from Google Maps URLs stored in `locationMapLink` |
| `buildMapPoints(bookings)` | Converts bookings with extractable coordinates into `MapPoint[]` for the map |
| `buildDistrictStats(bookings)` | Groups bookings by district, returns `DistrictStat[]` sorted by count |
| `buildCityStats(bookings)` | Groups bookings by city, returns `CityStat[]` sorted by count |
| `buildLocationInsights(...)` | Computes the `LocationInsightsSummary` object for the KPI card |
| `getUniqueEventTypes(bookings)` | Returns sorted array of all unique event type names |

### Map Marker Colours

Markers in the interactive map are colour-coded by event type:

| Event Type | Colour |
|---|---|
| Wedding | Pink `#ec4899` |
| Portrait | Indigo `#6366f1` |
| Corporate | Blue `#3b82f6` |
| Birthday Party | Amber `#f59e0b` |
| Graduation | Emerald `#10b981` |
| Engagement | Orange `#f97316` |
| Maternity | Violet `#8b5cf6` |
| Other / Custom | Gray `#a1a1aa` |

Markers are clustered by proximity using **Leaflet.MarkerCluster** (loaded via CDN inside an iframe `srcDoc`).

---

## Offline Payments, Proposal Deadlines & Dashboard Navigation Fixes

We implemented immediate real-time payment updates, persistent deadlines, and visual routing improvements on both backend and frontend.

### 1. Real-Time Offline Cash Payments
When offline cash payments are logged on the photographer's reservation panel, the updates are now broadcasted live to the customer's tracking page.
- **Backend changes**: [`payments.service.ts`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/backend/src/payments/payments.service.ts) queries all successful payments, computes the total sum, and emits it as `totalPaidInCents` via the `reservationUpdated` and `transactionLogged` socket events to both photographer and customer rooms.
- **Frontend changes**: [`useTracking.ts`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/frontend/src/app/book/track/%5Btoken%5D/hooks/useTracking.ts) listens to `transactionLogged` and dynamically refetches tracking details, enabling immediate UI updates for remaining balances and invoice downloads.

### 2. Persistent Proposal Expiration Deadlines
- **Behavior**: Modifying packages or notes in a proposed reservation request no longer resets the initial 24-hour expiration window.
- **Backend changes**: [`reservations.service.ts`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/backend/src/reservations/reservations.service.ts) is modified so that the `paymentDeadline` is only set to 24 hours from the current time if it has not been defined previously.

### 3. Display Logic: "Advance Requested"
- **Photographer-end behavior**: "Advance Requested" is hidden when a quotation is proposed (`status === 'PROPOSED'`) to avoid visual redundancy. Once the customer completes the payment, the field appears on the photographer's panel under settled statistics.
- **Frontend changes**: [`ProposalStatusCard.tsx`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/frontend/src/components/dashboard/ProposalStatusCard.tsx) displays the field exclusively when the reservation status is `CONFIRMED` or `COMPLETED`.

### 4. Interactive Selection & UUID Search
- **Persistent Proposal Views**: [`useDashboardReservations.ts`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/frontend/src/app/dashboard/hooks/useDashboardReservations.ts) does not reset the selection to `null` on actions like proposal submission or rejection, keeping the user in place.
- **Calendar Navigation Sync**: [`usePhotographerDashboard.ts`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/frontend/src/app/dashboard/hooks/usePhotographerDashboard.ts) listens to the URL's `id` search parameters with `useSearchParams()` to immediately highlight and display the selected reservation request.
- **UUID Search**: [`ReservationList.tsx`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/frontend/src/components/dashboard/ReservationList.tsx) matches search terms against the reservation `id` parameter.

### 5. Tracking Page Reservation ID Display
- **Behavior**: The unique Reservation ID is now displayed on the customer's tracking page header for easy copying and referencing.
- **Frontend changes**: [`ReservationHeader.tsx`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/frontend/src/components/tracking/ReservationHeader.tsx) renders the ID with selection-friendly font formatting under the header title.

### 6. Location Analytics PDF Reports
- **Behavior**: Real-time generation and downloading of PDF reports summarizing geographic statistics, detailed booking logs, and visual static maps of booking points.
- **Backend changes**:
  - [`reports-pdf-builder.ts`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/backend/src/reports/reports-pdf-builder.ts): Serving as clean re-export entrypoint for modularized generator sub-files:
    - [`pdf-shared.ts`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/backend/src/reports/pdf-shared.ts): Shared layout styles, colors, and line-chart rendering helpers.
    - [`pdf-financial.ts`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/backend/src/reports/pdf-financial.ts): Financial analytics PDF generation logic.
    - [`pdf-bookings.ts`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/backend/src/reports/pdf-bookings.ts): Bookings and category traffic PDF generation logic.
    - [`pdf-location.ts`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/backend/src/reports/pdf-location.ts): Geographic analytics, distribution tables, and dynamic static maps display in the PDF.
  - [`reports.service.ts`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/backend/src/reports/reports.service.ts): Parses lat/lon coordinates from booking maps links, queries Yandex Static Maps API to get the preview image buffer, and feeds it to the PDF renderer.
- **Frontend changes**: Added a "Location PDF" download button in the reports header section on both photographer and admin reports panels.

### 7. Monthly & Yearly Date Filters and Timeline Labels
- **Behavior**: Enables selecting a specific year (when "yearly" is active) or selecting a specific month & year (when "monthly" is active) to view and download precise analytics reports instead of only sliding relative window periods.
- **Backend changes**:
  - [`reports.service.ts`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/backend/src/reports/reports.service.ts): Formats yearly timeline labels with both short month and year (e.g. "Jun 2026") to avoid overlap and improve visual clarity.
- **Frontend changes**:
  - [`ReportsHeader.tsx`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/frontend/src/app/dashboard/reports/components/ReportsHeader.tsx) & [`AdminReportsPage.tsx`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/frontend/src/components/dashboard/reports/AdminReportsPage.tsx): Display Month and Year dropdown lists conditionally.
  - [`useReports.ts`](file:///c:/My%20files/BIT%20-%20UOC%20%282025,%202026%29/Source/photographer-portal/frontend/src/app/dashboard/reports/hooks/useReports.ts): Computes exact date boundaries for selected month/year filter options and appends them to reports query URLs.

---



