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
└── frontend/                # Next.js app (port 4000)
    └── src/
        ├── app/
        │   ├── login/       # Login page
        │   ├── dashboard/   # Role-based collapsible dashboard
        │   ├── api-tester/  # Interactive developer API Docs & Tester Console
        │   └── book/[slug]/ # Public booking page
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

pgAdmin credentials (defined in `docker-compose.yml`):
- Username: `admin@photoportal.com`
- Password: `pgadminsecure123`

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

## Stopping Docker

```bash
docker compose down
```

Data is persisted in `./postgres-data/` and survives restarts. To wipe the data volume:

```bash
docker compose down -v
rm -rf ./postgres-data
```
