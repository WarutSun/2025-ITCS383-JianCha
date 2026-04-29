const db = require('./src/database/db');

const seedData = async () => {
  try {
    const [cars] = await db.query('SELECT COUNT(*) as count FROM cars');
    
    if (cars[0].count > 0) {
      console.log('Database already has car data. Skipping seed.');
      process.exit(0);
    }

    console.log('Seeding database with initial car data...');

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

    const query = 'INSERT INTO cars (brand, model, type, license_plate, price_per_day, location, discount_percent, is_promotion) VALUES ?';
    await db.query(query, [sampleCars]);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
