const db = require('../database/db');

const createReview = async (req, res) => {
  try {
    const { booking_id, car_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!booking_id || !car_id || !rating) {
      return res.status(400).json({ message: 'booking_id, car_id, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify booking belongs to user and is completed
    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ? AND car_id = ?',
      [booking_id, user_id, car_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found or does not belong to you' });
    }

    if (bookings[0].status !== 'completed') {
      return res.status(400).json({ message: 'You can only review a completed booking' });
    }

    // Check if review already exists for this booking
    const [existingReviews] = await db.query('SELECT id FROM reviews WHERE booking_id = ?', [booking_id]);
    if (existingReviews.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    // Insert review
    await db.query(
      'INSERT INTO reviews (booking_id, user_id, car_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [booking_id, user_id, car_id, rating, comment]
    );

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getReviewsByCar = async (req, res) => {
  try {
    const { carId } = req.params;

    const [reviews] = await db.query(
      `SELECT r.*, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.car_id = ?
       ORDER BY r.created_at DESC`,
      [carId]
    );

    res.json(reviews);
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createReview, getReviewsByCar };
