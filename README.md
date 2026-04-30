# Travel Naja Car Rental Reservation System

## 🌐 Live Demo

-https://test1-wvuw.vercel.app/

### 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Staff | staff@jiancha.com | staff1234 |
| Member | (register via app) | - |

This repository contains a full-stack car rental reservation system built as part of the Travel Naja platform. It demonstrates a simple RESTful API backed by a MySQL database and a modern React/Tailwind frontend using shadcn/ui components. The backend handles user authentication, car listings, bookings, cancellations, staff reporting, and promotion management.

---

## 🚀 Project Overview

- **Domain**: Car rental reservations
- **Purpose**: Allow users to browse available cars, make reservations, view/cancel their bookings, and provide staff with an administrative dashboard and reports.
- **Architecture**: Split into two main implementations:
  - **Backend** (Node.js/Express) offers JSON APIs and connects to MySQL
  - **Frontend** (React + Vite + Tailwind + shadcn/ui) provides a SPA for customers and staff
  - Docker Compose is used for running the database locally.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS (v3), shadcn/ui |
| Backend | Node.js (>=20), Express, JWT, bcrypt |
| Database | MySQL (dockerized via `docker-compose`) |
| Hosting | Vercel (frontend), Render (backend), Clever Cloud (MySQL) |
| Dev Ops | Docker, Git, GitHub Actions |

---

## ✅ Prerequisites

Make sure you have the following installed:

- Node.js **v20 or later**
- Docker (for MySQL service)
- Git (for cloning the repo)

---

## 🛠️ Build & Run Instructions

```bash
# 1. Clone the repository
git clone https://github.com/ICT-Mahidol/2025-ITCS383-JianCha.git
cd 2025-ITCS383-JianCha

# 2. Start MySQL database
docker compose up -d

# 3. Start Backend (Terminal 1)
cd implementations/backend
cp .env.example .env
npm install
npm run dev

# 4. Update Frontend .env with your Codespace URL (Terminal 2)
# First, check your Codespace name:
echo $CODESPACE_NAME
# Example output: crispy-robot-pj449jw97rg3g96

# Then update the frontend .env:
echo "VITE_API_URL=https://${CODESPACE_NAME}-8080.app.github.dev/api" > implementations/frontend/.env

# Verify it looks correct (example):
cat implementations/frontend/.env
# Expected output:
# VITE_API_URL=https://crispy-robot-pj449jw97rg3g96-8080.app.github.dev/api

# 5. Start Frontend (Terminal 2)
cd implementations/frontend
npm install
npm run dev
```

### ⚠️ Codespace Warning
If you are running this project inside a **GitHub Codespace**, after starting the backend:

1. Open the **PORTS** tab in the Codespace UI.
2. Right-click on port **8080** and set **Visibility → Public**.
3. Re-run step 4 every time you open a new Codespace (URL changes each time).

Otherwise, the frontend won't be able to reach the backend because of tunnel authentication.

---

## 🔌 Default Ports

- Backend API: http://localhost:8080
- Frontend app: http://localhost:5173

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create a new member account |
| POST | `/api/auth/login` | No | Authenticate and receive JWT |

### Cars
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cars` | No | List available cars (`?location=&type=`) |
| GET | `/api/cars/:id` | No | Get details for a single car |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bookings` | Member | Retrieve bookings for logged-in user |
| POST | `/api/bookings` | Member | Create a new booking (supports `promo_code`) |
| DELETE | `/api/bookings/:id` | Member | Cancel a booking |
| PUT | `/api/bookings/:id/pay` | Member | Confirm payment for a booking |

### User Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile` | Member | Get current user profile |
| PUT | `/api/users/profile` | Member | Update user name |

### Staff (Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/staff/dashboard` | Staff | Overview stats (bookings, revenue, cars) |
| GET | `/api/staff/reports/reservations` | Staff | Full reservation report |
| GET | `/api/staff/cars` | Staff | List all cars including unavailable |
| POST | `/api/staff/cars` | Staff | Add new car |
| PUT | `/api/staff/cars/:id` | Staff | Update car details |
| DELETE | `/api/staff/cars/:id` | Staff | Delete car |
| PUT | `/api/staff/cars/:id/promotion` | Staff | Set promotion discount on car |
| DELETE | `/api/staff/reset` | Staff | Reset all bookings and restore cars |

### Local Guides
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/guides` | No | List approved guides |
| POST | `/api/guides/request` | No | Submit guide request |
| PUT | `/api/guides/:id/approve` | Staff | Approve guide application |
| PUT | `/api/guides/:id/reject` | Staff | Reject guide application |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | API health check |

> All authenticated endpoints require `Authorization: Bearer <token>` header.

---

## 🎟️ Promo Codes

| Code | Discount |
|------|----------|
| `ONLYTRAVELNAJA` | 30% off |
| `GUBONUS` | 30% off |
| `MEGA` | 30% off |

---

## ⚙️ Running Backend Tests

```bash
# Make sure Docker is running first
docker compose up -d

cd implementations/backend
npm test
```

### ✅ Test Results

```
Test Suites: 4 passed, 4 total
Tests:       35 passed, 35 total
Coverage:    79.52% statements
Time:        ~3s
```

| Test Suite | What is tested |
|---|---|
| auth.test.js | Register, login, duplicate email, missing fields |
| car.test.js | List cars, filter by location/type, get by ID, 404 |
| booking.test.js | Auth guard, create booking, cancel, pay, promo code, date validation |
| staff.test.js | Dashboard stats, reports, car CRUD, reset DB |

### ⚠️ Common Issue — Tests Failing with 500 Errors

**Root Cause:** MySQL not running or `.env` credentials don't match `docker-compose.yml`

```bash
# Check Docker is running
docker ps

# Check .env credentials match docker-compose.yml
cat implementations/backend/.env | grep DB_PASSWORD
# Must match MYSQL_PASSWORD in docker-compose.yml
```

---

## 🧪 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Staff | staff@jiancha.com | staff1234 |
| Member | Register via the app | - |

To create a staff user manually:
```sql
UPDATE users SET role = 'staff' WHERE email = 'you@example.com';
```

---

## 📁 Repository Structure

```
.
├── docker-compose.yml
├── designs/                        # D1 - C4 diagrams
├── implementations/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── database/
│   │   └── tests/
│   └── frontend/
│       └── src/
│           ├── pages/
│           ├── components/
│           └── services/
├── AGENTS.md
├── Jiancha_D3_AILog.md
├── Jiancha_D4_QualityReport.md
└── README.md
```

---

## 🎯 Notes

- Rental period is limited to **30 days**. Contact admin for long-term rentals.
- Past dates cannot be selected for pickup.
- Payment is simulated (no real payment gateway).
- The service is structured for educational/demo purposes.

Thank you from Jiancha Group
```
6688009	Sunattha	Boonla-or
6688076	Kunruethai	Patimapornchai
6688095	Tinakome	Rasripenngam
6688104	 Phubase	Sangliamthong
6688137	Natnicha	Uppariputthangkul
6688163	Aroonrat	Choochue
---
