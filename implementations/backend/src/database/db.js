const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'jiancha',
  password: process.env.DB_PASSWORD || 'jianchapassword',
  database: process.env.DB_NAME || 'jiancha_car_rental',
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

    // Check if cars table is empty, if so, seed it
    const [cars] = await connection.query('SELECT COUNT(*) as count FROM cars');
    if (cars[0].count === 0) {
      console.log('Seeding initial car data...');
      const sampleCars = [
        ['Toyota', 'Camry', 'sedan', 'ABC-1234', 1500.00, 'Bangkok', 10, true],
        ['Honda', 'Accord', 'sedan', 'ABC-1112', 1600.00, 'Bangkok', 0, false],
        ['Nissan', 'Altima', 'sedan', 'ABC-1113', 1400.00, 'Bangkok', 15, true],
        ['Mazda', 'Mazda6', 'sedan', 'ABC-1114', 1550.00, 'Bangkok', 0, false],
        ['BMW', '320i', 'sedan', 'ABC-1115', 2500.00, 'Bangkok', 20, true],
        ['Hyundai', 'Elantra', 'sedan', 'ABC-1116', 1300.00, 'Bangkok', 0, false],
        ['Kia', 'K5', 'sedan', 'ABC-1117', 1350.00, 'Bangkok', 0, false],
        ['Toyota', 'Corolla', 'sedan', 'ABC-1118', 1200.00, 'Bangkok', 5, true],
        ['Honda', 'City', 'sedan', 'ABC-1119', 1100.00, 'Bangkok', 0, false],
        ['Mitsubishi', 'Lancer', 'sedan', 'ABC-1120', 1250.00, 'Bangkok', 0, false],
        ['Honda', 'CR-V', 'suv', 'XYZ-5678', 2000.00, 'Bangkok', 10, true],
        ['Toyota', 'RAV4', 'suv', 'XYZ-2112', 2100.00, 'Bangkok', 0, false],
        ['Nissan', 'Rogue', 'suv', 'XYZ-2113', 1900.00, 'Bangkok', 0, false],
        ['Mazda', 'CX-5', 'suv', 'XYZ-2114', 2050.00, 'Bangkok', 0, false],
        ['BMW', 'X5', 'suv', 'XYZ-2115', 3500.00, 'Bangkok', 15, true],
        ['Hyundai', 'Santa Fe', 'suv', 'XYZ-2116', 1850.00, 'Bangkok', 0, false],
        ['Kia', 'Sorento', 'suv', 'XYZ-2117', 1950.00, 'Bangkok', 0, false],
        ['Toyota', 'Fortuner', 'suv', 'XYZ-2118', 2200.00, 'Bangkok', 10, true],
        ['Isuzu', 'MU-X', 'suv', 'XYZ-2119', 2150.00, 'Bangkok', 0, false],
        ['Ford', 'Explorer', 'suv', 'XYZ-2120', 2300.00, 'Bangkok', 0, false],
        ['Toyota', 'Alphard', 'van', 'DEF-9012', 3500.00, 'Bangkok', 20, true],
        ['Honda', 'Odyssey', 'van', 'DEF-3112', 3200.00, 'Bangkok', 0, false],
        ['Nissan', 'Elgrand', 'van', 'DEF-3113', 3400.00, 'Bangkok', 0, false],
        ['Kia', 'Carnival', 'van', 'DEF-3114', 2900.00, 'Bangkok', 10, true],
        ['Toyota', 'Hiace', 'van', 'DEF-3115', 2500.00, 'Bangkok', 0, false],
        ['Mercedes-Benz', 'V-Class', 'van', 'DEF-3116', 4500.00, 'Bangkok', 15, true],
        ['Volkswagen', 'Caravelle', 'van', 'DEF-3117', 3800.00, 'Bangkok', 0, false],
        ['Hyundai', 'H350', 'van', 'DEF-3118', 2800.00, 'Bangkok', 0, false],
        ['Mitsubishi', 'Delica', 'van', 'DEF-3119', 3100.00, 'Bangkok', 0, false],
        ['Toyota', 'Sienna', 'van', 'DEF-3120', 3300.00, 'Bangkok', 0, false],
        ['Toyota', 'Camry', 'sedan', 'CMI-1001', 1500.00, 'Chiang Mai', 10, true],
        ['Honda', 'CR-V', 'suv', 'CMI-2001', 2000.00, 'Chiang Mai', 0, false],
        ['Toyota', 'Hiace', 'van', 'CMI-3001', 2500.00, 'Chiang Mai', 0, false],
        ['Nissan', 'Altima', 'sedan', 'CMI-1002', 1400.00, 'Chiang Mai', 5, true],
        ['Mazda', 'CX-5', 'suv', 'CMI-2002', 2050.00, 'Chiang Mai', 0, false],
        ['Toyota', 'Corolla', 'sedan', 'PHU-1001', 1200.00, 'Phuket', 10, true],
        ['Honda', 'Accord', 'sedan', 'PHU-1002', 1600.00, 'Phuket', 0, false],
        ['Toyota', 'RAV4', 'suv', 'PHU-2001', 2100.00, 'Phuket', 0, false],
        ['Nissan', 'Rogue', 'suv', 'PHU-2002', 1900.00, 'Phuket', 5, true],
        ['Kia', 'Carnival', 'van', 'PHU-3001', 2900.00, 'Phuket', 10, true]
      ];
      const insertQuery = 'INSERT INTO cars (brand, model, type, license_plate, price_per_day, location, discount_percent, is_promotion) VALUES ?';
      await connection.query(insertQuery, [sampleCars]);
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
