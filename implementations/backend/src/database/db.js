const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Run migrations on startup
const runMigrations = async () => {
  try {
    const connection = await pool.getConnection();

    // Create users table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('member', 'staff') DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cars table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        type ENUM('sedan', 'suv', 'van') NOT NULL,
        license_plate VARCHAR(20) UNIQUE NOT NULL,
        price_per_day DECIMAL(10,2) NOT NULL,
        location VARCHAR(100) NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        discount_percent INT DEFAULT 0,
        is_promotion BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create bookings table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        car_id INT NOT NULL,
        pickup_date DATE NOT NULL,
        return_date DATE NOT NULL,
        pickup_location VARCHAR(100),
        dropoff_location VARCHAR(100),
        dropoff_fee DECIMAL(10,2) DEFAULT 0.00,
        total_price DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (car_id) REFERENCES cars(id)
      )
    `);

    // Create reviews table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL UNIQUE,
        user_id INT NOT NULL,
        car_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (car_id) REFERENCES cars(id)
      )
    `);

    // Seed data from single source of truth
    const { SAMPLE_CARS, SEED_INSERT_QUERY, PROMO_MODELS } = require('../utils/seedData');

    // Check if cars table is empty, if so, seed it
    const [cars] = await connection.query('SELECT COUNT(*) as count FROM cars');
    if (cars[0].count === 0) {
      console.log('Seeding initial car data...');
      await connection.query(SEED_INSERT_QUERY, [SAMPLE_CARS]);
    } else {
      // If table is NOT empty, check if we have any promotions
      const [promos] = await connection.query('SELECT COUNT(*) as count FROM cars WHERE is_promotion = TRUE');
      if (promos[0].count === 0) {
        console.log('No promotions found in existing database. Adding promotions to sample cars...');
        await connection.query('UPDATE cars SET is_promotion = TRUE, discount_percent = 15 WHERE model IN (?)', [PROMO_MODELS]);
      }
    }

    // Migration logic for existing tables (adding columns if they were created by old schema)
    const [carColumns] = await connection.query('SHOW COLUMNS FROM cars');
    const carColumnNames = carColumns.map(col => col.Field);

    if (!carColumnNames.includes('discount_percent')) {
      await connection.query('ALTER TABLE cars ADD COLUMN discount_percent INT DEFAULT 0');
    }
    if (!carColumnNames.includes('is_promotion')) {
      await connection.query('ALTER TABLE cars ADD COLUMN is_promotion BOOLEAN DEFAULT FALSE');
    }

    const [bookingColumns] = await connection.query('SHOW COLUMNS FROM bookings');
    const bookingColumnNames = bookingColumns.map(col => col.Field);

    if (!bookingColumnNames.includes('pickup_location')) {
      await connection.query('ALTER TABLE bookings ADD COLUMN pickup_location VARCHAR(100)');
    }
    if (!bookingColumnNames.includes('dropoff_location')) {
      await connection.query('ALTER TABLE bookings ADD COLUMN dropoff_location VARCHAR(100)');
    }
    if (!bookingColumnNames.includes('dropoff_fee')) {
      await connection.query('ALTER TABLE bookings ADD COLUMN dropoff_fee DECIMAL(10,2) DEFAULT 0.00');
    }

    await connection.query(`ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending'`);

    connection.release();
    console.log('Database migrations and seeding completed');
  } catch (err) {
    console.error('Migration error:', err);
  }
};

runMigrations();

module.exports = pool;
