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

### c. Code Quality (SonarQube Analysis)

The project was analyzed using SonarQube, and the results show that the system **passed the Quality Gate**, indicating that it meets the required quality standards.

### Quality Metrics Summary

| Metric | Result |
|------|------|
| Quality Gate | Passed |
| Security Issues | 0 |
| Reliability Issues | 0 |
| Maintainability Issues | 3 |
| Test Coverage | 72.9% |
| Code Duplication | 0.0% |
| Security Hotspots | 2 |

---

### Strengths

- **No Bugs (Reliability A)** → System is stable
- **No Vulnerabilities (Security A)** → No critical security risks detected
- **0% Code Duplication** → Clean and maintainable codebase
- **Good Test Coverage (72.9%)** → Most core features are tested

---

### Maintainability Issues (3 Issues)

1. **Using Array instead of Set (bookingController.js)**
   - Promo codes stored in array instead of Set
   - Recommended: use `Set` and `.has()` for better performance

2. **Unexpected negated condition (staffCarController.js)**
   - Reduces readability
   - Should simplify logic for clarity

3. **Using Array instead of Set (db.js)**
   - Column checking uses array instead of Set
   - Should use `Set` for efficiency

---

### Security Hotspots (2 Issues)

1. **CORS Configuration**
   - Location: `app.js`
   - Issue: Allows all origins (`origin: '*'`)
   - Risk: Any domain can access the API
   - Recommendation: Restrict allowed origins in production

2. **Framework Information Exposure**
   - The system may expose framework/version details
   - Should be reviewed to prevent information leakage

---

### Overall Evaluation

The project demonstrates **high code quality**:

- Security: ⭐⭐⭐⭐⭐ (A)
- Reliability: ⭐⭐⭐⭐⭐ (A)
- Maintainability: ⭐⭐⭐⭐☆ (A with minor issues)

Only **minor improvements** are needed, mainly related to:
- Code readability
- Data structure optimization
- Security configuration

---

### Conclusion

The system is **well-structured, stable, and maintainable**, with no critical issues.  
It is suitable for further development and extension.

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
