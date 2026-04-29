const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.RAILWAY_DB_HOST,
      port: process.env.RAILWAY_DB_PORT,
      user: process.env.RAILWAY_DB_USER,
      password: process.env.RAILWAY_DB_PASSWORD,
      database: process.env.RAILWAY_DB_NAME,
    });

    console.log('Connected to Railway DB. Applying promotions...');
    await connection.query('UPDATE cars SET is_promotion = 1, discount_percent = 25 WHERE id IN (1, 5, 11, 20)');
    console.log('✅ Promotions successfully applied to the live database!');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error applying promotions:', error.message);
  }
}

run();
