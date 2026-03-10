# Travel Naja Car Rental Reservation System — Agent Setup Guide

## Project Overview

**Project Name**: Travel Naja Car Rental Reservation System

**Description**: A full-stack car rental reservation platform featuring user authentication, car browsing, date-based booking with promo codes, payment simulation, and staff administrative dashboards. Built with React + Vite + shadcn/ui on the frontend and Node.js + Express on the backend, backed by MySQL.

---

## Quick Start

### Prerequisites

- Node.js v20 or later
- Docker (for MySQL service)
- Git

### Starting All Services

```bash
# 1. Clone and navigate to project
git clone https://github.com/earthslipz/Jiancha-Travel-Reservation-System-focus-on-car-rental-reservation-.git
cd Jiancha-Travel-Reservation-System-focus-on-car-rental-reservation-

# 2. Start MySQL database
docker compose up -d

# 3. Start backend (in a new terminal)
cd implementations/backend
cp .env.example .env  # Configure if needed (defaults work locally)
npm install
npm run dev

# 4. Start frontend (in another new terminal)
cd implementations/frontend
npm install
npm run dev
```

### ⚠️ GitHub Codespace Users

After starting the backend service, if running in a GitHub Codespace:

1. Go to the **PORTS** tab in the Codespace UI
2. Right-click on port **8080** and select **"Set Visibility → Public"**
3. The frontend will then be able to reach the backend API

Without this step, the frontend cannot connect to the backend due to tunnel authentication restrictions.

---

## Default Ports

| Service  | URL                      | Purpose           |
|----------|--------------------------|-------------------|
| Frontend | http://localhost:5173   | React SPA         |
| Backend  | http://localhost:8080   | Express API       |
| MySQL    | localhost:3306          | Database service  |

---

## API Endpoints Reference

### Authentication

| Method | Path              | Auth | Description                      |
|--------|-------------------|------|----------------------------------|
| POST   | `/api/auth/register` | No   | Register new member account      |
| POST   | `/api/auth/login`    | No   | Login and receive JWT token      |

### Cars

| Method | Path           | Auth | Description                                  |
|--------|----------------|------|----------------------------------------------|
| GET    | `/api/cars`    | No   | List available cars (query: `?location=&type=`) |
| GET    | `/api/cars/:id` | No   | Get single car details                       |

### Bookings

| Method | Path              | Auth         | Description                              |
|--------|-------------------|--------------|------------------------------------------|
| POST   | `/api/bookings`   | Yes (member) | Create new booking with optional promo   |
| GET    | `/api/bookings`   | Yes (member) | Get user's bookings                      |
| DELETE | `/api/bookings/:id` | Yes (member) | Cancel existing booking                  |

### Staff (Admin)

| Method | Path                           | Auth        | Description                    |
|--------|--------------------------------|-------------|--------------------------------|
| GET    | `/api/staff/dashboard`         | Yes (staff) | Dashboard stats & overview     |
| GET    | `/api/staff/reports/reservations` | Yes (staff) | Full reservation report        |

### Health Check

| Method | Path      | Auth | Description      |
|--------|-----------|------|-------------------|
| GET    | `/health` | No   | API health status |

---

## Database Schema

### `users` Table

| Column      | Type | Description              |
|-------------|------|--------------------------|
| id          | INT (PK) | User ID             |
| name        | VARCHAR(100) | User full name    |
| email       | VARCHAR(100) UNIQUE | Email address |
| password    | VARCHAR(255) | Hashed password |
| role        | ENUM('member', 'staff') | User role |
| created_at  | TIMESTAMP | Registration time |

### `cars` Table

| Column       | Type | Description              |
|--------------|------|--------------------------|
| id           | INT (PK) | Car ID             |
| brand        | VARCHAR(100) | Car brand (Toyota, Honda) |
| model        | VARCHAR(100) | Car model (Camry, CR-V) |
| type         | ENUM('sedan', 'suv', 'van') | Vehicle type |
| license_plate | VARCHAR(20) UNIQUE | License plate |
| price_per_day | DECIMAL(10,2) | Daily rental rate |
| location     | VARCHAR(100) | Available location |
| is_available | BOOLEAN | Availability status |
| created_at   | TIMESTAMP | Record creation time |

### `bookings` Table

| Column       | Type | Description              |
|--------------|------|--------------------------|
| id           | INT (PK) | Booking ID             |
| user_id      | INT (FK) | Reference to users |
| car_id       | INT (FK) | Reference to cars |
| pickup_date  | DATE | Rental start date |
| return_date  | DATE | Rental end date |
| total_price  | DECIMAL(10,2) | Total cost (after discounts) |
| status       | ENUM('pending', 'confirmed', 'cancelled') | Booking status |
| created_at   | TIMESTAMP | Booking creation time |

---

## Environment Variables

### Backend (`.env`)

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=jiancha_car_rental
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
PORT=8080
```

### Frontend (`.env`)

```
VITE_API_URL=http://localhost:8080/api
```

---

## Running Tests

```bash
cd implementations/backend
npm test
```

Tests are written with Jest and cover:
- Authentication logic (register, login)
- Booking creation and validation
- Car availability checks
- Date validation (no past dates, max 30 days)
- Promo code application and discounting

---

## Key Features

### 1. User Authentication
- JWT-based authentication
- Role-based access control (member/staff)
- Password hashing with bcrypt

### 2. Car Browsing
- Filter by location and type
- Real-time availability tracking
- Display pricing and details

### 3. Booking System
- Calendar date picker UI (shadcn/ui)
- Past date blocking
- Max 30-day rental limit
- Promo code validation (ONLYTRAVELNAJA, GUBONUS, MEGA offer 30% discount)
- Payment simulation page before confirmation

### 4. Staff Dashboard
- View total bookings and revenue stats
- Generate detailed reservation reports
- Access restricted to users with `role = 'staff'`

### 5. Booking Management
- View personal bookings
- Cancel existing reservations
- See discount amounts if promo applied

---

## Tech Stack Summary

| Layer  | Technology |
|--------|-----------|
| Frontend  | React 19, Vite, Tailwind CSS v3, shadcn/ui, react-router-dom, axios, date-fns |
| Backend   | Node.js, Express, MySQL, JWT, bcrypt, express-rate-limit, CORS, helmet |
| Database  | MySQL (containerized via Docker) |
| DevOps    | Docker, Docker Compose, Git |

---

## Project Structure

```
implementations/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app & routes setup
│   │   ├── server.js              # Server entry point
│   │   ├── controllers/           # Business logic
│   │   │   ├── authController.js
│   │   │   ├── carController.js
│   │   │   ├── bookingController.js
│   │   │   └── staffController.js
│   │   ├── routes/                # Endpoint definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── carRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   └── staffRoutes.js
│   │   ├── middleware/            # Auth & validation
│   │   │   └── authMiddleware.js
│   │   └── database/              # DB config & schema
│   │       ├── db.js
│   │       └── schema.sql
│   ├── tests/                     # Jest test files
│   ├── jest.config.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.jsx               # Entry point
    │   ├── App.jsx                # Root component & routing
    │   ├── pages/                 # Route components
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Cars.jsx           # Car browsing + booking form
    │   │   ├── Bookings.jsx       # User's bookings
    │   │   ├── PaymentSimulation.jsx
    │   │   └── Staff/
    │   │       ├── Dashboard.jsx
    │   │       └── Reports.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx         # Navigation bar
    │   │   └── ui/                # shadcn components
    │   │       ├── button.jsx
    │   │       ├── card.jsx
    │   │       ├── input.jsx
    │   │       ├── calendar.jsx
    │   │       └── popover.jsx
    │   ├── services/
    │   │   └── api.js             # Axios instance with auth
    │   └── lib/
    │       ├── auth.js            # JWT decoding utilities
    │       └── utils.js           # cn() helper
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm install` (backend/frontend dir) | Install dependencies |
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm test` (backend) | Run Jest tests |
| `docker compose up -d` (root) | Start MySQL container |
| `docker compose down` (root) | Stop MySQL container |

---

## Notes for Developers & Agents

1. **Authentication**: All protected endpoints require `Authorization: Bearer <JWT_TOKEN>` header.
2. **CORS**: Backend accepts requests from any origin (`*`). Configure in production.
3. **Rate Limiting**: API enforces 100 requests per 15 minutes per IP.
4. **Promo Codes**: Valid codes are `ONLYTRAVELNAJA`, `GUBONUS`, `MEGA` (case-insensitive). Each offers 30% discount.
5. **Rental Limits**: Max 30 days per booking. Longer rentals must be handled manually.
6. **Payment Simulation**: No real payment processing. Frontend simulates 2-second processing and then creates booking.
7. **Database**: Auto-creates tables and populates sample cars on first schema run.
8. **Staff Access**: Only users with `role = 'staff'` can access `/staff` and `/staff/reports` routes.

---

## Troubleshooting

### "Cannot POST /api/bookings" or "Cannot GET /api/cars"
- Ensure backend is running: `npm run dev` in `implementations/backend/`
- Check that port 8080 is not blocked or already in use

### Frontend says "Cannot connect to backend"
- If in Codespace, set port 8080 to Public in PORTS tab
- Check `VITE_API_URL` in frontend `.env` matches backend URL
- Verify CORS is enabled in `app.js`

### Database connection errors
- Ensure Docker is running: `docker compose up -d`
- Check `.env` file has correct DB credentials
- Verify MySQL container is healthy: `docker ps`

### Tests fail
- Run from `implementations/backend/` directory
- Ensure database is running
- Check `jest.config.js` for correct setup

---

## Further Development

To extend this system:
- Add more travel modules (hotels, flights) to Travel Naja
- Implement real payment gateway (Stripe, PayPal)
- Add email notifications for bookings
- Implement advanced filtering and search
- Add user reviews and ratings
- Create mobile app with React Native
- Set up CI/CD pipeline (GitHub Actions)

---

Happy coding! 🚗💨
