const db = require('./src/database/db');
const { SAMPLE_CARS, SEED_INSERT_QUERY } = require('./src/utils/seedData');

const seedData = async () => {
  try {
    const [cars] = await db.query('SELECT COUNT(*) as count FROM cars');
    
    if (cars[0].count > 0) {
      console.log('Database already has car data. Skipping seed.');
      process.exit(0);
    }

    console.log('Seeding database with initial car data...');
    await db.query(SEED_INSERT_QUERY, [SAMPLE_CARS]);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
