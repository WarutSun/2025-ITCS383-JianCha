const db = require('../database/db');

const getAllCars = async (req, res) => {
  try {
    const { location, type } = req.query;
    let query = `
      SELECT c.*, 
        COALESCE(AVG(r.rating), 0) as avg_rating, 
        COUNT(r.id) as review_count
      FROM cars c
      LEFT JOIN reviews r ON c.id = r.car_id
      WHERE c.is_available = TRUE
    `;
    const params = [];

    if (location) { query += ' AND c.location = ?'; params.push(location); }
    if (type) { query += ' AND c.type = ?'; params.push(type); }

    query += ' GROUP BY c.id';

    const [cars] = await db.query(query, params);
    
    // Add discounted_price to each car
    const carsWithDiscount = cars.map(car => ({
      ...car,
      discounted_price: car.is_promotion ? Math.round(car.price_per_day * (1 - car.discount_percent / 100)) : car.price_per_day,
      avg_rating: Number(car.avg_rating).toFixed(1),
      review_count: Number(car.review_count)
    }));
    
    res.json(carsWithDiscount);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getCarById = async (req, res) => {
  try {
    const query = `
      SELECT c.*, 
        COALESCE(AVG(r.rating), 0) as avg_rating, 
        COUNT(r.id) as review_count
      FROM cars c
      LEFT JOIN reviews r ON c.id = r.car_id
      WHERE c.id = ?
      GROUP BY c.id
    `;
    const [cars] = await db.query(query, [req.params.id]);
    
    if (cars.length === 0)
      return res.status(404).json({ message: 'Car not found' });
      
    const car = {
      ...cars[0],
      discounted_price: cars[0].is_promotion ? Math.round(cars[0].price_per_day * (1 - cars[0].discount_percent / 100)) : cars[0].price_per_day,
      avg_rating: Number(cars[0].avg_rating).toFixed(1),
      review_count: Number(cars[0].review_count)
    };
    
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllCars, getCarById };
