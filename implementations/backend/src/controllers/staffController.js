const db = require('../database/db');
const { findBookingById, completeCarReturn } = require('../utils/bookingHelpers');

// get overall stats for dashboard
const getDashboard = async (req, res) => {
  try {
    const [[bookingStats]] = await db.query(
      'SELECT COUNT(*) AS totalBookings, COALESCE(SUM(total_price),0) AS totalRevenue FROM bookings'
    );
    const [[carStats]] = await db.query(
      'SELECT COUNT(*) AS availableCars FROM cars WHERE is_available = TRUE'
    );

    res.json({
      totalBookings: bookingStats.totalBookings,
      totalRevenue: Number(bookingStats.totalRevenue),
      availableCars: carStats.availableCars,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// return full reservation list for reports
const getReservationReport = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, u.name AS user_name, u.email AS user_email, c.brand, c.model, c.location
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN cars c ON b.car_id = c.id`);
    res.json(rows);
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// reset database - delete all bookings and reset car availability
const resetDatabase = async (req, res) => {
  try {
    // Delete all bookings
    await db.query('DELETE FROM bookings');
    
    // Reset all cars to available
    await db.query('UPDATE cars SET is_available = TRUE');
    
    res.json({ message: 'Database reset successfully' });
  } catch (err) {
    console.error('Reset DB error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const returnCar = async (req, res) => {
  try {
    const booking = await findBookingById(req.params.id);
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' });

    if (booking.status !== 'confirmed')
      return res.status(400).json({ message: 'Only confirmed bookings can be returned' });

    await completeCarReturn(booking);

    res.json({ message: 'Car returned and booking completed successfully' });
  } catch (err) {
    console.error('Return car error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard, getReservationReport, resetDatabase, returnCar };