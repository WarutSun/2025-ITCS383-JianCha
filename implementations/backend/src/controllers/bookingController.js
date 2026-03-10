const db = require('../database/db');

const VALID_PROMO_CODES = ['ONLYTRAVELNAJA', 'GUBONUS', 'MEGA'];
const DISCOUNT_PERCENT = 30;

const createBooking = async (req, res) => {
  try {
    const { car_id, pickup_date, return_date, promo_code } = req.body;
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

    let total_price = days * car.price_per_day;

    // Apply promo code discount if valid
    if (promo_code) {
      if (VALID_PROMO_CODES.includes(promo_code.toUpperCase())) {
        total_price = Math.round(total_price * (1 - DISCOUNT_PERCENT / 100));
      }
    }

    await db.query(
      'INSERT INTO bookings (user_id, car_id, pickup_date, return_date, total_price) VALUES (?, ?, ?, ?, ?)',
      [user_id, car_id, pickup_date, return_date, total_price]
    );
    await db.query('UPDATE cars SET is_available = FALSE WHERE id = ?', [car_id]);

    res.status(201).json({ message: 'Booking created', total_price });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const getMyBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.*, c.brand, c.model, c.type, c.location 
       FROM bookings b JOIN cars c ON b.car_id = c.id 
       WHERE b.user_id = ?`,
      [req.user.id]
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if booking exists and belongs to the user
    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (bookings.length === 0)
      return res.status(404).json({ message: 'Booking not found' });

    const booking = bookings[0];

    // Check if booking can be cancelled (not already cancelled)
    if (booking.status === 'cancelled')
      return res.status(400).json({ message: 'This booking is already cancelled' });

    // Update booking status to cancelled
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);

    // Set car back to available
    await db.query('UPDATE cars SET is_available = TRUE WHERE id = ?', [booking.car_id]);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const payBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if booking exists and belongs to the user
    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (bookings.length === 0)
      return res.status(404).json({ message: 'Booking not found' });

    const booking = bookings[0];

    // Check if booking is pending
    if (booking.status !== 'pending')
      return res.status(400).json({ message: 'This booking is not pending payment' });

    // Update booking status to confirmed
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['confirmed', id]);

    res.json({ message: 'Payment successful! Booking confirmed', booking: { ...booking, status: 'confirmed' } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking, payBooking };
