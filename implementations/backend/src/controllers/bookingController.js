const db = require('../database/db');
const { getDropoffFee } = require('../utils/dropoffFees');
const { calculateDiscountedPrice, applyPromoDiscount } = require('../utils/pricing');
const { findUserBooking, completeCarReturn } = require('../utils/bookingHelpers');

const createBooking = async (req, res) => {
  try {
    const { car_id, pickup_date, return_date, promo_code, dropoff_location } = req.body;
    const user_id = req.user.id;

    if (!car_id || !pickup_date || !return_date)
      return res.status(400).json({ message: 'All fields are required' });

    // Check if pickup date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pickupDateObj = new Date(pickup_date);
    pickupDateObj.setHours(0, 0, 0, 0);
    
    if (pickupDateObj < today)
      return res.status(400).json({ message: 'Pickup date cannot be in the past' });

    const [cars] = await db.query('SELECT * FROM cars WHERE id = ? AND is_available = TRUE', [car_id]);
    if (cars.length === 0)
      return res.status(404).json({ message: 'Car not available' });

    const car = cars[0];
    const days = Math.ceil((new Date(return_date) - new Date(pickup_date)) / (1000 * 60 * 60 * 24));
    if (days <= 0)
      return res.status(400).json({ message: 'Invalid dates' });

    // Check if rental period exceeds 30 days
    if (days > 30)
      return res.status(400).json({ message: 'Rental period cannot exceed 30 days. Contact admin for long-term rentals.' });

    // Use discounted price if promotion is active
    const price_per_day = calculateDiscountedPrice(car.price_per_day, car.is_promotion, car.discount_percent);
    let total_price = days * price_per_day;

    // Apply promo code discount if valid
    total_price = applyPromoDiscount(total_price, promo_code);

    // Calculate drop-off fee if location is different
    const pickup_location = car.location;
    const final_dropoff_location = dropoff_location ? dropoff_location.trim() : pickup_location;
    const dropoff_fee = getDropoffFee(pickup_location, final_dropoff_location);
    
    total_price += dropoff_fee;

    const [result] = await db.query(
      'INSERT INTO bookings (user_id, car_id, pickup_date, return_date, pickup_location, dropoff_location, dropoff_fee, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, car_id, pickup_date, return_date, pickup_location, final_dropoff_location, dropoff_fee, total_price, 'pending']
    );
    await db.query('UPDATE cars SET is_available = FALSE WHERE id = ?', [car_id]);

    res.status(201).json({ message: 'Booking created', total_price, booking_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const getMyBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.*, c.brand, c.model, c.type, c.location,
              IF(r.id IS NOT NULL, 1, 0) as has_review
       FROM bookings b 
       JOIN cars c ON b.car_id = c.id 
       LEFT JOIN reviews r ON b.id = r.booking_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await findUserBooking(req.params.id, req.user.id);
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' });

    if (booking.status === 'cancelled')
      return res.status(400).json({ message: 'This booking is already cancelled' });

    // Update booking status to cancelled
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', booking.id]);

    // Set car back to available
    await db.query('UPDATE cars SET is_available = TRUE WHERE id = ?', [booking.car_id]);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const payBooking = async (req, res) => {
  try {
    const booking = await findUserBooking(req.params.id, req.user.id);
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' });

    if (booking.status !== 'pending')
      return res.status(400).json({ message: 'This booking is not pending payment' });

    await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['confirmed', booking.id]);

    res.json({ message: 'Payment successful! Booking confirmed', booking: { ...booking, status: 'confirmed' } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const returnBooking = async (req, res) => {
  try {
    const booking = await findUserBooking(req.params.id, req.user.id);
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' });

    if (booking.status !== 'confirmed')
      return res.status(400).json({ message: 'Only confirmed bookings can be returned' });

    await completeCarReturn(booking);

    res.json({ message: 'Car returned successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking, payBooking, returnBooking };
