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
├── backend/                 # NestJS API (port 3000)
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
└── frontend/                # Next.js app (port 3001)
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

### 2. Configure backend environment

Create `backend/.env`:

```env
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
```

*Note: Database connection parameters default to host: `localhost` and port: `5433` for local development.*

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
# Backend (port 3000)
cd backend && npm run start:dev

# Frontend (port 3001) — in a separate terminal
cd frontend && npm run dev
```

---

## Usage

### Admin login

Open `http://localhost:3001/login`

| Field | Value |
|---|---|
| Email | `admin@photoportal.com` |
| Password | `SuperSecret123!` |

### Customer booking flow

Each photographer has a unique shareable link:

```
http://localhost:3001/book/<booking-slug>
```

Seeded examples:
- `http://localhost:3001/book/sarah-johnson`
- `http://localhost:3001/book/michael-fernando`

The booking flow has three steps:
1. **Check availability** — pick a date, time range, and event type
2. **Your details** — name, email, phone, optional venue and notes
3. **Confirmation** — displays a tracking URL to check reservation status

Customers do not need an account.

---

## API Documentation & Tester Console

For testing API endpoints, use the interactive panel built directly into the frontend:
- **URL**: `http://localhost:3001/api-tester`
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
