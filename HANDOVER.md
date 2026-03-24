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

