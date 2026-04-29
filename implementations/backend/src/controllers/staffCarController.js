const db = require('../database/db');

// Get all cars (including unavailable)
const getAllCars = async (req, res) => {
  try {
    const [cars] = await db.query('SELECT * FROM cars ORDER BY created_at DESC');
    res.json(cars);
  } catch (err) {
    console.error('Staff get cars error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new car
const addCar = async (req, res) => {
  try {
    const { brand, model, type, license_plate, price_per_day, location, discount_percent, is_promotion } = req.body;

    // Validate required fields
    if (!brand || !model || !type || !license_plate || !price_per_day || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [result] = await db.query(
      'INSERT INTO cars (brand, model, type, license_plate, price_per_day, location, is_available, discount_percent, is_promotion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [brand, model, type, license_plate, price_per_day, location, true, discount_percent || 0, is_promotion || false]
    );

    res.status(201).json({
      message: 'Car added successfully',
      id: result.insertId
    });
  } catch (err) {
    console.error('Add car error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update car
const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, model, type, license_plate, price_per_day, location, is_available, discount_percent, is_promotion } = req.body;

    if (!brand || !model || !type || !license_plate || !price_per_day || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [result] = await db.query(
      'UPDATE cars SET brand = ?, model = ?, type = ?, license_plate = ?, price_per_day = ?, location = ?, is_available = ?, discount_percent = ?, is_promotion = ? WHERE id = ?',
      [brand, model, type, license_plate, price_per_day, location, is_available !== undefined ? is_available : true, discount_percent || 0, is_promotion || false, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car updated successfully' });
  } catch (err) {
    console.error('Update car error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete car (check no active bookings first)
const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if car has any pending or confirmed bookings
    const [[booking]] = await db.query(
      'SELECT COUNT(*) AS count FROM bookings WHERE car_id = ? AND status IN (?, ?)',
      [id, 'pending', 'confirmed']
    );

    if (booking.count > 0) {
      return res.status(400).json({ message: 'Cannot delete car with active bookings' });
    }

    const [result] = await db.query('DELETE FROM cars WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    console.error('Delete car error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const setPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { discount_percent, is_promotion } = req.body;

    // Validate discount_percent
    if (discount_percent < 0 || discount_percent > 100) {
      return res.status(400).json({ message: 'Discount percent must be between 0 and 100' });
    }

    const [result] = await db.query(
      'UPDATE cars SET discount_percent = ?, is_promotion = ? WHERE id = ?',
      [discount_percent, is_promotion, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Promotion updated successfully' });
  } catch (err) {
    console.error('Set promotion error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllCars, addCar, updateCar, deleteCar, setPromotion };
