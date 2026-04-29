const mysql = require('mysql2/promise');

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: 'switchback.proxy.rlwy.net',
      port: 37056,
      user: 'root',
      password: 'SfAwSBWNAHtRcSBGDyuzzTXZzyTqILhD',
      database: 'railway',
    });

    console.log('Connected to Railway DB. Applying promotions...');
    await connection.query('UPDATE cars SET is_promotion = 1, discount_percent = 25 WHERE id IN (1, 5, 11, 20)');
    console.log('✅ Promotions successfully applied to the live database!');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error applying promotions:', error);
  }
}

run();
