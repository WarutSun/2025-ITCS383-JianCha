const db = require('../database/db');

const createBooking = async (req, res) => {
  try {
    const { car_id, pickup_date, return_date } = req.body;
    const user_id = req.user.id;

    if (!car_id || !pickup_date || !return_date)
      return res.status(400).json({ message: 'All fields are required' });

    const [cars] = await db.query('SELECT * FROM cars WHERE id = ? AND is_available = TRUE', [car_id]);
    if (cars.length === 0)
      return res.status(404).json({ message: 'Car not available' });

    const car = cars[0];
    const days = Math.ceil((new Date(return_date) - new Date(pickup_date)) / (1000 * 60 * 60 * 24));
    if (days <= 0)
      return res.status(400).json({ message: 'Invalid dates' });

    const total_price = days * car.price_per_day;

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

module.exports = { createBooking, getMyBookings };
