const mysql = require('mysql2/promise');
require('dotenv').config();

const checkDb = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database');
    
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', users[0].count);

    const [cars] = await connection.query('SELECT COUNT(*) as count FROM cars');
    console.log('Cars count:', cars[0].count);

    const [availableCars] = await connection.query('SELECT COUNT(*) as count FROM cars WHERE is_available = TRUE');
    console.log('Available cars count:', availableCars[0].count);

    await connection.end();
  } catch (err) {
    console.error('Error checking DB:', err.message);
  }
};

checkDb();
