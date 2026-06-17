# MOTD Platform

**MOTD** stands for **Mukhawar of the Day** — a hybrid UAE/GCC marketplace (AED) with two customer journeys:

- **Ready-made** — standard e-commerce for finished clothes
- **Custom tailoring** — fabric selection, tailor shop, design, and measurements

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, next-intl (AR/EN) |
| Backend | Node.js, Express, MongoDB (Mongoose) |
| Auth (MVP) | JWT + email/password |

## Project structure

```
motd-project/
├── frontend/          # Next.js customer app
├── backend/           # Express API
├── Design/            # HTML/CSS design reference
└── archive/           # Archived reference code
```

## Getting started

1. Copy environment variables:

   ```bash
   cp .env.example backend/.env
   ```

2. Install dependencies:

   ```bash
   npm run install:all
   ```

3. Start development servers (API on `:5000`, frontend on `:3000`):

   ```bash
   npm run dev
   ```

   The customer app is locale-prefixed: [http://localhost:3000/en](http://localhost:3000/en) (LTR) and [http://localhost:3000/ar](http://localhost:3000/ar) (RTL). Visiting `/` redirects to the default locale (`en`).

## Environment variables

Copy `.env.example` to `backend/.env` and set at least:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing auth tokens |
| `CORS_ORIGIN` | Frontend origin (default `http://localhost:3000`) |
| `PORT` | API port (default `5000`) |

The backend validates required variables on startup. Auth is JWT + MongoDB only.

4. Seed local MongoDB with test data (optional, for API/FE integration):

   ```bash
   cd backend && npm run seed
   ```

   Test logins, sample slugs, and expected counts: [`docs/seed-handoff.md`](docs/seed-handoff.md). Schema reference: [`docs/schema.md`](docs/schema.md).

### Auth API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/users/signup` | Register (role: `customer`) |
| `POST` | `/api/users/signin` | Sign in |
| `GET` | `/api/users/profile` | Current user (Bearer token) |
| `PUT` | `/api/users/profile` | Update profile |
| `GET` | `/api/users` | List users (admin only) |

## Archived reference

The original Anastacia MERN e-commerce clone lives in `archive/ANASTACIA-MERN-ECOMMERCE/` for reference during migration. It is not part of the active application.
