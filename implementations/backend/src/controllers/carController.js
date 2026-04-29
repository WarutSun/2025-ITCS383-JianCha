const db = require('../database/db');
const { calculateDiscountedPrice } = require('../utils/pricing');

/**
 * Enrich a raw car row with computed fields (discounted_price, formatted ratings).
 */
const enrichCarData = (car) => ({
  ...car,
  discounted_price: calculateDiscountedPrice(car.price_per_day, car.is_promotion, car.discount_percent),
  avg_rating: Number(car.avg_rating).toFixed(1),
  review_count: Number(car.review_count)
});

const CAR_WITH_REVIEWS_QUERY = `
  SELECT c.*, 
    COALESCE(AVG(r.rating), 0) as avg_rating, 
    COUNT(r.id) as review_count
  FROM cars c
  LEFT JOIN reviews r ON c.id = r.car_id
`;

const getAllCars = async (req, res) => {
  try {
    const { location, type } = req.query;
    let query = CAR_WITH_REVIEWS_QUERY + ' WHERE c.is_available = TRUE';
    const params = [];

    if (location) { query += ' AND c.location = ?'; params.push(location); }
    if (type) { query += ' AND c.type = ?'; params.push(type); }

    query += ' GROUP BY c.id';

    const [cars] = await db.query(query, params);
    res.json(cars.map(enrichCarData));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getCarById = async (req, res) => {
  try {
    const query = CAR_WITH_REVIEWS_QUERY + ' WHERE c.id = ? GROUP BY c.id';
    const [cars] = await db.query(query, [req.params.id]);
    
    if (cars.length === 0)
      return res.status(404).json({ message: 'Car not found' });
    
    res.json(enrichCarData(cars[0]));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllCars, getCarById };
