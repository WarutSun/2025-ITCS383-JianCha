const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { getDashboard, getReservationReport, resetDatabase } = require('../controllers/staffController');
const { getAllCars, addCar, updateCar, deleteCar } = require('../controllers/staffCarController');

// role-check middleware
const authorizeRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Dashboard and Reports
router.get('/dashboard', authenticate, authorizeRole('staff'), getDashboard);
router.get('/reports/reservations', authenticate, authorizeRole('staff'), getReservationReport);
router.delete('/reset', authenticate, authorizeRole('staff'), resetDatabase);

// Car Management
router.get('/cars', authenticate, authorizeRole('staff'), getAllCars);
router.post('/cars', authenticate, authorizeRole('staff'), addCar);
router.put('/cars/:id', authenticate, authorizeRole('staff'), updateCar);
router.delete('/cars/:id', authenticate, authorizeRole('staff'), deleteCar);

module.exports = router;