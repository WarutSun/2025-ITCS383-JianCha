const db = require('../database/db');

/**
 * Find a booking by ID that belongs to a specific user.
 * Returns the booking object or null.
 */
const findUserBooking = async (bookingId, userId) => {
  const [bookings] = await db.query(
    'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
    [bookingId, userId]
  );
  return bookings.length > 0 ? bookings[0] : null;
};

/**
 * Find a booking by ID (no user check — for staff use).
 * Returns the booking object or null.
 */
const findBookingById = async (bookingId) => {
  const [bookings] = await db.query(
    'SELECT * FROM bookings WHERE id = ?',
    [bookingId]
  );
  return bookings.length > 0 ? bookings[0] : null;
};

/**
 * Complete a car return: mark booking as completed and update car availability.
 * Optionally updates the car's location to the dropoff location.
 */
const completeCarReturn = async (booking) => {
  await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['completed', booking.id]);

  const newLocation = booking.dropoff_location || booking.pickup_location;
  if (newLocation) {
    await db.query('UPDATE cars SET is_available = TRUE, location = ? WHERE id = ?', [newLocation, booking.car_id]);
  } else {
    await db.query('UPDATE cars SET is_available = TRUE WHERE id = ?', [booking.car_id]);
  }
};

module.exports = { findUserBooking, findBookingById, completeCarReturn };
