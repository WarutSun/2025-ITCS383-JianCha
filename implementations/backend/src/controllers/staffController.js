const db = require('../database/db');

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
    res.status(500).json({ message: 'Server error', error: err.message });
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
    res.status(500).json({ message: 'Server error', error: err.message });
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
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getDashboard, getReservationReport, resetDatabase };