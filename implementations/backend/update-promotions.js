const db = require('./src/database/db');

async function run() {
  try {
    await db.query('UPDATE cars SET is_promotion = 1, discount_percent = 25 WHERE id IN (1, 5, 11, 20)');
    console.log('Successfully updated 4 cars to be on promotion (25% off)');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

run();
