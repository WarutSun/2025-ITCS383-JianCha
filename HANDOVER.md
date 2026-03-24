# HANDOVER.md

## 1. Features of the Received Project

The **Travel Naja Car Rental Reservation System** is a full-stack web application that allows users to browse cars, make reservations, and manage bookings, while also providing staff with administrative capabilities.

### User Features (Guest & Member)
- **User Registration & Authentication**
  - Register and login using JWT authentication
- **Browse Cars**
  - View available cars with filters (location, type)
- **Car Details**
  - View detailed information of each car
- **Booking System**
  - Create reservations
  - Apply promo codes
  - Cancel bookings
  - Confirm payment (simulated)
- **User Profile**
  - View and update profile
- **Local Guides**
  - View approved guides
  - Submit guide requests

### Staff Features (Admin)
- Dashboard (view bookings, revenue, cars)
- Car management (add, update, delete)
- Reservation reports
- Promotion management
- System reset
- Guide approval/rejection

### System Features
- RESTful API
- JWT Authentication & Authorization
- MySQL database
- Docker support
- Automated tests (35 passing)

---

## 2. Design Verification (C4 vs Implementation)

### Consistencies

#### Context Diagram
- Guest, Member, and Staff roles are correctly implemented
- Role-based access control exists
- Payment is represented (simulated)

#### Container Diagram
- React frontend implemented
- Express backend implemented
- MySQL database implemented

#### Component Diagram
- Controllers and routes implemented
- Booking logic implemented
- Reporting (staff endpoints) implemented

---

### Inconsistencies

- No real external systems (Car Agency, Hotel Agency, Flight Agency)
- No API Gateway (merged into backend)
- Payment is simulated (no real gateway)
- System implemented as monolith (not microservices)

---

### Updated C4 (Actual Implementation)

User
↓
React Frontend (Vite + Tailwind)
↓
Node.js Express Backend (Monolith)
↓
MySQL Database (Docker)


---

## 3. Reflection

### a. Technologies Used

**Frontend**
- React
- Vite
- Tailwind CSS
- shadcn/ui

**Backend**
- Node.js
- Express
- JWT
- bcrypt

**Database**
- MySQL (Docker)

**DevOps**
- Docker
- GitHub
- Vercel
- Render

---

### b. Required Information for Handover

- Node.js >= 20
- Docker installed
- `.env` configuration (backend & frontend)
- Database credentials must match docker-compose
- Correct API URL (VITE_API_URL)
- Ports:
  - Backend: 8080
  - Frontend: 5173
- Test account:
  - staff@jiancha.com / staff1234

**Common Issues**
- MySQL not running → backend errors
- Wrong `.env` → cannot connect database

---

### c. Code Quality (SonarQube)

**Test Coverage**
- 79.52% coverage
- 35 tests passed

**Strengths**
- Clear folder structure
- Good API design
- Authentication implemented
- Tests cover main features

**Weaknesses**
- No service layer
- Some logic inside controllers
- No external API abstraction
- Monolithic structure

**Estimated SonarQube Results**
- Bugs: Low
- Vulnerabilities: Low
- Code Smells: Medium
- Maintainability: Medium
- Reliability: High

---

## D1: Runnable System Verification

The project was successfully executed:

- MySQL runs via Docker
- Backend runs on port 8080
- Frontend runs on port 5173
- API works correctly

**Verified Features**
- User registration & login
- Car browsing
- Booking system
- Staff management features

---

## Conclusion

The project is functional and ready for further development. Although the implementation differs from the original design (monolithic instead of modular), it still satisfies core requirements and is easy to extend.
