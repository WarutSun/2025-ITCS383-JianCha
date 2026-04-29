const db = require('./src/database/db');

const resetDb = async () => {
  try {
    console.log('Stopping active processes and resetting database...');
    
    // We must delete in order due to foreign keys
    await db.query('DELETE FROM reviews');
    await db.query('DELETE FROM bookings');
    await db.query('DELETE FROM cars');
    
    console.log('Database cleared.');
    console.log('Restart the backend to automatically re-seed with the latest promotion data.');
    
    process.exit(0);
  } catch (err) {
    console.error('Reset error:', err);
    process.exit(1);
  }
};

resetDb();
