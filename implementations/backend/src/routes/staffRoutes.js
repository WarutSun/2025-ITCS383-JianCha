const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');
const { getDashboard, getReservationReport, resetDatabase, returnCar } = require('../controllers/staffController');
const { getAllCars, addCar, updateCar, deleteCar, setPromotion } = require('../controllers/staffCarController');

// Dashboard and Reports
router.get('/dashboard', authenticate, authorizeRole('staff'), getDashboard);
router.get('/reports/reservations', authenticate, authorizeRole('staff'), getReservationReport);
router.delete('/reset', authenticate, authorizeRole('staff'), resetDatabase);
router.put('/return/:id', authenticate, authorizeRole('staff'), returnCar);

// Car Management
router.get('/cars', authenticate, authorizeRole('staff'), getAllCars);
router.post('/cars', authenticate, authorizeRole('staff'), addCar);
router.put('/cars/:id', authenticate, authorizeRole('staff'), updateCar);
router.put('/cars/:id/promotion', authenticate, authorizeRole('staff'), setPromotion);
router.delete('/cars/:id', authenticate, authorizeRole('staff'), deleteCar);

module.exports = router;