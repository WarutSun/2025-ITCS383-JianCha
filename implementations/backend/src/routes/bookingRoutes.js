const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { createBooking, getMyBookings } = require('../controllers/bookingController');

router.get('/', authenticate, getMyBookings);
router.post('/', authenticate, createBooking);

module.exports = router;
