const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { createBooking, getMyBookings, cancelBooking, payBooking } = require('../controllers/bookingController');

router.get('/', authenticate, getMyBookings);
router.post('/', authenticate, createBooking);
router.delete('/:id', authenticate, cancelBooking);
router.put('/:id/pay', authenticate, payBooking);

module.exports = router;
