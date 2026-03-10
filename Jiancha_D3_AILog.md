## Entry 1 — Project Structure Setup
- **Date:** 2026-02-28
- **Prompt used:** "Setup repo structure for Travel Naja car rental system with React frontend and Express backend"
- **Accepted:** Folder structure for backend/frontend, branch strategy
- **Rejected:** None
- **Verification:** Manually verified folder structure matches project requirements

## Entry 2 — Backend Setup
- **Date:** 2026-02-28
- **Prompt used:** "Setup Express.js backend with MySQL, JWT auth, helmet, rate limiting for car rental system"
- **Accepted:** app.js structure, middleware setup, route scaffolding, trust proxy fix
- **Rejected:** rate-limit without trust proxy (caused validation error in Codespace environment)
- **Verification:** Ran `npm run dev`, hit /health endpoint, returned {"status":"ok"}

## Entry 3 — Database Setup
- **Date:** 2026-02-28
- **Prompt used:** "Create MySQL schema for car rental system with users, cars, bookings tables and Docker setup"
- **Accepted:** Schema design, docker-compose, connection pool
- **Rejected:** None
- **Verification:** Ran docker ps confirmed container up, ran SHOW TABLES confirmed all 3 tables created

## Entry 4 — Controllers and Routes
- **Date:** 2026-02-28
- **Prompt used:** "Implement Express controllers for auth (register/login), car listing, and booking with JWT middleware"
- **Accepted:** All controllers, middleware, updated routes
- **Rejected:** None
- **Verification:** curl POST /api/auth/register returned 201, curl GET /api/cars returned 3 cars from DB

## Entry 4 — Controllers and Routes
- **Date:** 2026-02-28
- **Prompt used:** "Implement Express controllers for auth (register/login), car listing, and booking with JWT middleware"
- **Accepted:** All controllers, middleware, updated routes
- **Rejected:** None
- **Verification:** curl POST /api/auth/register returned 201, curl GET /api/cars returned 3 cars from DB

## Entry 5 — Unit Tests
- **Date:** 2026-02-28
- **Prompt used:** "Write Jest unit tests for auth, car, and booking endpoints using supertest"
- **Accepted:** All test files, jest config
- **Rejected:** None
- **Verification:** npm test — 15/15 passed, 87.59% statement coverage

## Entry 6 — GitHub Actions CI Pipeline
- **Date:** 2026-02-28
- **Prompt used:** "Create GitHub Actions CI pipeline with MySQL service container, ESLint, and Jest coverage"
- **Accepted:** Full workflow file, eslint config
- **Rejected:** None
- **Verification:** Pushed to dev branch, checked GitHub Actions tab for green pipeline

## Entry 7 — Frontend Setup with React + Vite
- **Date:** 2026-02-28
- **Tool:** Claude AI
- **Prompt used:** "Setup React Vite frontend with react-router-dom and axios for car rental system"
- **Accepted:** Folder structure, page components, routing, api service
- **Rejected:** None
- **Verification:** Ran `npm run dev`, opened http://localhost:5173, confirmed all pages render correctly

## Entry 8 — Frontend Redesign with shadcn/ui (Travel Naja theme)
- **Tool:** GitHub Copilot
- **Prompt used:** "Redesign React app to look like unified travel platform Travel Naja using shadcn/ui. Home page shows 3 service cards: Flights, Car Rental, Hotels. Flights and Hotels show Coming Soon badge. Keep all existing logic intact."
- **Accepted:** shadcn/ui component integration, Travel Naja branding, service cards layout, dark theme
- **Rejected:** Initial shadcn setup that used incompatible Tailwind v3 syntax with Tailwind v4
- **Verification:** 
  - Fixed CSS by replacing `@tailwind base/components/utilities` with `@import tailwindcss`
  - Installed missing `tailwindcss-animate` package
  - Ran `npm run dev` confirmed no errors
  - Manually tested all pages: Home, Cars, Login, Register, Bookings
  - Confirmed Flights and Hotels cards show "Coming Soon" and are disabled
  - Confirmed Car Rental card links to /cars and booking still works

## Entry 9 — Frontend Bug Fix (Tailwind v4 + shadcn compatibility)
- **Date:** 2026-02-28
- **Tool:** Claude AI
- **Prompt used:** "Fix tailwindcss PostCSS error bg-background unknown utility class in Vite + shadcn setup"
- **Accepted:** Updated index.css to use `@import tailwindcss`, installed tailwindcss-animate
- **Rejected:** Downgrading Tailwind version (would break shadcn)
- **Verification:** Error dismissed, `npm run dev` runs clean, UI renders correctly

## Entry 10 — Fix CORS and Codespace Network Configuration
- **Date:** 2026-02-28
- **Tool:** Claude AI
- **Prompt used:** "Fix CORS policy error between frontend and backend in GitHub Codespace environment"
- **Accepted:** Removed helmet middleware, added explicit CORS config with OPTIONS preflight, set port 8080 to Public visibility
- **Rejected:** CORS with helmet (caused header conflicts), localhost baseURL (not valid in Codespace)
- **Verification:** 
  - curl -I https://bug-free-waddle-jx47gpvxg9wcqxw-8080.app.github.dev/api/cars returned HTTP 200
  - Frontend /cars page successfully loaded car listing from backend
  - Register, Login, Book Car all working end-to-end

## Entry 11 — Frontend Environment Config
- **Date:** 2026-02-28
- **Tool:** Claude AI  
- **Prompt used:** "Configure VITE_API_URL env variable to use Codespace backend URL instead of localhost"
- **Accepted:** .env with VITE_API_URL, updated api.js to use import.meta.env
- **Rejected:** Hardcoded localhost (not accessible from browser in Codespace)
- **Verification:** Network tab in browser confirmed requests going to correct Codespace URL

## Entry 12 — Staff Dashboard + Reports
- **Date:** 2026-02-28
- **Tool:** GitHub Copilot
- **Prompt used:** "Add staff dashboard to React + Express car rental app with GET /api/staff/dashboard and GET /api/staff/reports/reservations, protect with JWT role staff, add Staff Dashboard and Reports pages using shadcn/ui"
- **Accepted:** staffRoutes.js, staffController.js, Staff/Dashboard.jsx, Staff/Reports.jsx, protected routes
- **Rejected:** None
- **Verification:** Seeded staff user via API, updated role in DB, logged in as staff, confirmed Staff link visible in Navbar, Dashboard shows stats, Reports shows all reservations

## Entry 13 — Cancel Reservation
- **Date:** 2026-02-28
- **Tool:** GitHub Copilot
- **Prompt used:** "Add cancel reservation feature with DELETE /api/bookings/:id, update status to cancelled, set car is_available back to TRUE"
- **Accepted:** cancelBooking controller, DELETE route, Cancel button in Bookings.jsx
- **Rejected:** None
- **Verification:** Logged in as member, cancelled booking, confirmed status changed to cancelled and car became available again

## Entry 16 — Car Search & Filter + Staff Car CRUD + Calendar Fix + Payment Button Fix
- **Date:** 2026-03-10
- **Tool:** GitHub Copilot
- **Prompt used:** "Fix calendar white theme, fix Pay Now button green color, add Staff Car CRUD endpoints and CarManagement page, add Cars page search/filter by name/type/location/sort"
- **Accepted:** Calendar bg-white wrapper, green Pay Now button, staffCarController.js, CarManagement.jsx, search+filter+sort client-side in Cars.jsx
- **Rejected:** None
- **Verification:** Manually tested calendar navigation visible, Pay Now button green and visible, Staff can add/edit/delete cars, search and filter working on Cars page

## Entry 17 — Updated Unit Tests for New Endpoints
- **Date:** 2026-03-10
- **Tool:** GitHub Copilot
- **Prompt used:** "Update Jest tests to cover new endpoints: staff dashboard, staff car CRUD, reset DB, pay booking, promo code discount, date validation"
- **Accepted:** tests/staff.test.js, updated tests/booking.test.js with new test cases
- **Rejected:** None
- **Verification:** npm test — all tests passed
