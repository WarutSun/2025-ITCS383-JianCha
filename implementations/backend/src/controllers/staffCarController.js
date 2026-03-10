const db = require('../database/db');

// Get all cars (including unavailable)
const getAllCars = async (req, res) => {
  try {
    const [cars] = await db.query('SELECT * FROM cars ORDER BY created_at DESC');
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add new car
const addCar = async (req, res) => {
  try {
    const { brand, model, type, license_plate, price_per_day, location } = req.body;

    // Validate required fields
    if (!brand || !model || !type || !license_plate || !price_per_day || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [result] = await db.query(
      'INSERT INTO cars (brand, model, type, license_plate, price_per_day, location, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [brand, model, type, license_plate, price_per_day, location, true]
    );

    res.status(201).json({
      message: 'Car added successfully',
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update car
const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, model, type, license_plate, price_per_day, location, is_available } = req.body;

    if (!brand || !model || !type || !license_plate || !price_per_day || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [result] = await db.query(
      'UPDATE cars SET brand = ?, model = ?, type = ?, license_plate = ?, price_per_day = ?, location = ?, is_available = ? WHERE id = ?',
      [brand, model, type, license_plate, price_per_day, location, is_available !== undefined ? is_available : true, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
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
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllCars, addCar, updateCar, deleteCar };
