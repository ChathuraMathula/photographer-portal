# Photographer Portal

A reservation management system for photographers. Super Admins manage photographer accounts and generate shareable booking links. Customers use those links to check availability and submit reservation requests — no account required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeScript |
| Frontend | Next.js 16 (App Router), React 19 |
| Database | MongoDB 8 (via Mongoose 9) |
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
├── docker-compose.yml       # MongoDB + Mongo Express
├── backend/                 # NestJS API (port 3000)
│   ├── src/
│   │   ├── auth/            # JWT auth, guards, decorators
│   │   ├── bookings/        # Public booking flow (no auth)
│   │   ├── photographers/   # Photographer profile management
│   │   ├── reservations/    # Reservation management (protected)
│   │   ├── users/           # User / photographer account creation
│   │   ├── schemas/         # Mongoose schemas
│   │   ├── database/        # DatabaseModule (registers all schemas)
│   │   ├── scripts/         # seed-data.ts (shared seed logic)
│   │   ├── seed.ts          # npm run seed entry point
│   │   └── reset.ts         # npm run db:reset entry point
│   └── package.json
└── frontend/                # Next.js app (port 3001)
    └── src/
        ├── app/
        │   ├── login/       # Login page
        │   ├── dashboard/   # Role-based dashboard
        │   └── book/[slug]/ # Public booking page
        ├── config/routes.ts # Route permissions + public prefixes
        ├── proxy.ts         # Next.js middleware (auth guard)
        └── store/           # Redux store + authSlice
```

---

## Getting Started

### 1. Start the database

```bash
docker compose up -d
```

This starts:
- **MongoDB 8** on `localhost:27017`
- **Mongo Express** (DB UI) on `http://localhost:8081`

MongoDB credentials (defined in `docker-compose.yml`):
- Username: `admin`
- Password: `securepassword123`

### 2. Configure backend environment

Create `backend/.env`:

```env
MONGODB_URI=mongodb://admin:securepassword123@localhost:27017/photographer_portal?authSource=admin
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
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
- 2 Photographers: Sarah Johnson (`sarah-johnson`) and Michael Fernando (`michael-fernando`)
- Sample customers and reservations

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

## API Reference

### Public endpoints (no auth)

| Method | Path | Description |
|---|---|---|
| `GET` | `/bookings/:slug` | Photographer public profile |
| `GET` | `/bookings/:slug/availability?date=&startTime=&endTime=` | Check time slot availability |
| `POST` | `/bookings/:slug` | Submit a reservation request |
| `GET` | `/bookings/track/:token` | Track reservation status by token |

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Login, returns JWT cookie |
| `POST` | `/auth/logout` | Clear JWT cookie |

### Users (Super Admin only)

| Method | Path | Description |
|---|---|---|
| `POST` | `/users/photographers` | Create photographer account + profile |
| `GET` | `/users/photographers` | List all photographers |

### Reservations (Super Admin + Photographer)

| Method | Path | Description |
|---|---|---|
| `GET` | `/reservations` | List reservations (scoped by role) |
| `GET` | `/reservations/:id` | Get single reservation |
| `PATCH` | `/reservations/:id/status` | Update status |
| `PATCH` | `/reservations/:id/notes` | Add admin note |

### Photographers (Super Admin + Photographer)

| Method | Path | Description |
|---|---|---|
| `GET` | `/photographers` | List all profiles (Super Admin only) |
| `GET` | `/photographers/:id` | Get profile |
| `PATCH` | `/photographers/:id/profile` | Update profile |
| `GET` | `/photographers/:id/booking-link` | Get shareable URL |
| `PATCH` | `/photographers/:id/toggle-availability` | Toggle availability |

---

## Database Scripts

Run from the `backend/` directory:

```bash
# Seed with sample data (idempotent — safe to run multiple times)
npm run seed

# Drop the database and re-seed from scratch
npm run db:reset
```

`db:reset` is blocked if `MONGODB_URI` contains `prod` or `atlas` as a safety guard.

---

## Database Schema

### `users`
Auth records for Super Admins and Photographers only. Customers never log in.

| Field | Type | Notes |
|---|---|---|
| `firstName` | String | |
| `lastName` | String | |
| `email` | String | unique |
| `passwordHash` | String | bcrypt |
| `role` | Enum | `SUPER_ADMIN` \| `PHOTOGRAPHER` |
| `isActive` | Boolean | default `true` |
| `phone` | String | optional |

### `photographerprofiles`
Public-facing profile, 1-to-1 with a User of role `PHOTOGRAPHER`.

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | ref: User |
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
| `firstName` | String | |
| `lastName` | String | |
| `email` | String | unique |
| `phone` | String | |
| `address` | String | optional |
| `notes` | String | optional |

### `reservations`

| Field | Type | Notes |
|---|---|---|
| `customerId` | ObjectId | ref: Customer |
| `photographerId` | ObjectId | ref: User |
| `date` | Date | |
| `startTime` | String | `HH:MM` 24-hour format |
| `endTime` | String | `HH:MM` 24-hour format |
| `eventType` | String | e.g. `Wedding` |
| `location` | String | optional |
| `customerNotes` | String | optional |
| `adminNotes` | String | internal only |
| `totalAmountInCents` | Number | internal only, integer cents |
| `status` | Enum | `PENDING` \| `CONFIRMED` \| `CANCELLED` \| `COMPLETED` |
| `reservationToken` | String | unique, used for customer tracking URL |

### `packages`
Internal pricing reference. Never exposed to customers.

| Field | Type | Notes |
|---|---|---|
| `name` | String | |
| `description` | String | optional |
| `priceInCents` | Number | integer cents |
| `durationHours` | Number | |
| `includes` | String[] | |
| `isActive` | Boolean | default `true` |

---

## Roles & Permissions

| Role | Can do |
|---|---|
| `SUPER_ADMIN` | Create photographers, view all reservations, manage all profiles |
| `PHOTOGRAPHER` | View own reservations, update own profile, toggle availability |
| Customer (no auth) | Check availability, submit booking, track reservation by token |

---

## Database UI

Mongo Express runs at `http://localhost:8081` while Docker is up. No credentials required in the default dev setup.

---

## Stopping Docker

```bash
docker compose down
```

Data is persisted in `./database/` and survives restarts. To wipe the data volume:

```bash
docker compose down -v
rm -rf ./database
```
