# MediCare+ Clinic Appointment System

A clinic appointment and management application for MCA Clinic in Lahore. Patients can browse doctors, find available appointment slots, and book consultations. Clinic staff can manage doctors, schedules, leave dates, appointments, and walk-in patients from the admin dashboard.

## Features

- Search and browse doctors by name and specialty.
- Check doctor schedules and available appointment slots.
- Book an appointment and view a printable appointment receipt.
- Support for reception walk-ins and token numbers.
- Admin dashboard with daily appointment, walk-in, doctor, and revenue statistics.
- Admin tools for doctor profiles, working schedules, and leave dates.
- JWT-protected admin actions and password changes.
- Payment integration paths for Safepay and PayFast (sandbox configuration included), plus cash at the clinic.
- PostgreSQL persistence through Prisma.

## Technology

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Payments:** Safepay and PayFast

## Requirements

- Node.js 18 or newer and npm
- A PostgreSQL database (a Supabase PostgreSQL database can be used)

## Getting started

The frontend and backend run as separate applications. Start each one in its own terminal from the project root.

### 1. Install frontend dependencies

```powershell
npm install
```

### 2. Configure the backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` and set at least:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign admin authentication tokens |
| `ADMIN_EMAIL` | Admin account email created by the backend |
| `ADMIN_PASSWORD` | Admin account password created by the backend |
| `FRONTEND_URL` | Allowed frontend origin(s) for CORS; separate multiple origins with commas |
| `ACTIVE_PAYMENT_METHOD` | Payment method used by the booking flow, for example `CASH_AT_CLINIC`, `SAFEPAY`, or `PAYFAST` |

The example environment file includes sandbox payment settings. Replace them with credentials from the relevant payment provider before enabling a gateway. Never commit `.env` files or production secrets.

### 3. Set up the database

Run these commands from the `backend` directory:

```powershell
npm run prisma:generate
npm run prisma:migrate
```

`prisma:migrate` uses Prisma's development migration workflow and may ask you to name a migration when schema changes are detected.

To optionally load sample doctors, leave dates, appointments, and an admin:

```powershell
npm run prisma:seed
```

**Warning:** The seed script deletes existing payment transactions, appointments, leave dates, and doctors before inserting its sample data. Use it only with a disposable development database.

### 4. Start the backend

From `backend`:

```powershell
npm run dev
```

The API listens on `http://localhost:5000` by default. Check `http://localhost:5000/health` for service and database status.

### 5. Start the frontend

In a second terminal, return to the project root:

```powershell
cd ..
npm run dev
```

Vite serves the frontend at `http://localhost:3000` and opens it in a browser. The frontend API client currently targets `http://localhost:5000/api`; make sure the backend is running there.

## Useful commands

Run frontend commands from the project root:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the frontend |
| `npm run preview` | Preview the production frontend build |

Run backend commands from `backend`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API in watch mode |
| `npm run build` | Compile the backend TypeScript |
| `npm start` | Start the compiled backend |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run prisma:migrate` | Run Prisma development migrations |
| `npm run prisma:seed` | Replace clinic data with the included sample data |
| `npm run prisma:studio` | Open Prisma Studio |

## API overview

The API base URL is `http://localhost:5000/api`.

| Area | Routes |
| --- | --- |
| Authentication | `/auth/login`, `/auth/me`, `/auth/change-password` |
| Doctors | `/doctors` |
| Schedules | `/schedules/:doctorId` |
| Leave dates | `/leaves` |
| Appointments and slots | `/appointments`, `/appointments/book`, `/appointments/walkin`, `/appointments/doctors/:doctorId/slots` |
| Payments | `/payments/safepay/*`, `/payments/payfast/*` |
| Dashboard statistics | `/stats/dashboard` |

Admin-only operations require the JWT returned by `/auth/login` to be sent in the `Authorization` request header. Backend health endpoints are available at `/health` and `/api/health`.

## Project structure

```text
.
├── src/                 # React frontend
│   ├── components/      # Patient, admin, and shared UI
│   ├── context/         # Clinic state and API-backed actions
│   └── services/        # Frontend API client
└── backend/
    ├── prisma/          # Database schema, migrations, and seed
    └── src/
        ├── config/      # Environment configuration
        ├── controllers/ # API request handlers
        ├── middleware/  # Authentication middleware
        ├── routes/      # API routes
        └── services/    # Scheduling and payment services
```

## Production notes

- Set a strong, unique `JWT_SECRET` and use real administrator credentials.
- Configure production payment-provider credentials and webhook URLs before accepting online payments.
- Update `FRONTEND_URL` to the deployed frontend origin(s).
- The frontend currently has the API URL configured as `http://localhost:5000/api`; update it for a deployed backend.
- Do not use the sample seed data or sandbox credentials in production.
