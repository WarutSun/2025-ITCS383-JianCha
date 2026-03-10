const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/db');

let staffToken;
let testCarId;

beforeAll(async () => {
  // Delete test staff user if exists
  await db.query('DELETE FROM users WHERE email = ?', ['stafftest@test.com']);
  
  // Register and login as staff
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Staff User', email: 'stafftest@test.com', password: '123456', role: 'staff' });

  // Manually set role to staff (since register endpoint may not support role param)
  await db.query('UPDATE users SET role = ? WHERE email = ?', ['staff', 'stafftest@test.com']);

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'stafftest@test.com', password: '123456' });
  staffToken = res.body.token;
});

afterAll(async () => {
  // Clean up test data
  if (testCarId) {
    await db.query('DELETE FROM bookings WHERE car_id = ?', [testCarId]);
    await db.query('DELETE FROM cars WHERE id = ?', [testCarId]);
  }
  await db.query('DELETE FROM users WHERE email = ?', ['stafftest@test.com']);
  
  // Reset database for other tests
  await db.query('DELETE FROM bookings');
  await db.query('UPDATE cars SET is_available = TRUE');
  
  await db.end();
});

describe('Staff Endpoints', () => {
  describe('GET /api/staff/dashboard', () => {
    it('should return dashboard stats for staff', async () => {
      const res = await request(app)
        .get('/api/staff/dashboard')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalBookings');
      expect(res.body).toHaveProperty('totalRevenue');
      expect(res.body).toHaveProperty('availableCars');
      expect(typeof res.body.totalBookings).toBe('number');
      expect(typeof res.body.totalRevenue).toBe('number');
      expect(typeof res.body.availableCars).toBe('number');
    });

    it('should fail without staff role', async () => {
      // Create a member user
      await db.query('DELETE FROM users WHERE email = ?', ['member@test.com']);
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Member User', email: 'member@test.com', password: '123456' });

      const memberRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'member@test.com', password: '123456' });
      const memberToken = memberRes.body.token;

      const res = await request(app)
        .get('/api/staff/dashboard')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.statusCode).toBe(403);

      // Cleanup
      await db.query('DELETE FROM users WHERE email = ?', ['member@test.com']);
    });
  });

  describe('GET /api/staff/reports/reservations', () => {
    it('should return all reservations for staff', async () => {
      const res = await request(app)
        .get('/api/staff/reports/reservations')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/staff/cars', () => {
    it('should return all cars including unavailable', async () => {
      const res = await request(app)
        .get('/api/staff/cars')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Should include all cars
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should fail without staff role', async () => {
      const res = await request(app)
        .get('/api/staff/cars')
        .send({});
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/staff/cars', () => {
    it('should add new car successfully', async () => {
      const res = await request(app)
        .post('/api/staff/cars')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          brand: 'Test Brand',
          model: 'Test Model',
          type: 'sedan',
          license_plate: 'TEST-JEST-001',
          price_per_day: 1500,
          location: 'Test Location'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Car added successfully');
      expect(res.body).toHaveProperty('id');
      testCarId = res.body.id;
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/staff/cars')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          brand: 'Test Brand',
          model: 'Test Model'
          // Missing type, license_plate, price_per_day, location
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Missing required fields');
    });

    it('should fail without staff role', async () => {
      const res = await request(app)
        .post('/api/staff/cars')
        .send({
          brand: 'Test Brand',
          model: 'Test Model',
          type: 'sedan',
          license_plate: 'TEST-JEST-002',
          price_per_day: 1500,
          location: 'Test Location'
        });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/staff/cars/:id', () => {
    it('should update car details', async () => {
      const res = await request(app)
        .put(`/api/staff/cars/${testCarId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          brand: 'Updated Brand',
          model: 'Updated Model',
          type: 'suv',
          license_plate: 'TEST-JEST-001',
          price_per_day: 2000,
          location: 'Updated Location',
          is_available: false
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Car updated successfully');
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .put(`/api/staff/cars/${testCarId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          brand: 'Test Brand'
          // Missing other required fields
        });
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 for non-existent car', async () => {
      const res = await request(app)
        .put('/api/staff/cars/9999')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          brand: 'Test Brand',
          model: 'Test Model',
          type: 'sedan',
          license_plate: 'TEST-JEST-999',
          price_per_day: 1500,
          location: 'Test Location'
        });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/staff/reset', () => {
    it('should reset database', async () => {
      const res = await request(app)
        .delete('/api/staff/reset')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Database reset successfully');
    });

    it('should fail without staff role', async () => {
      const res = await request(app)
        .delete('/api/staff/reset')
        .send({});
      expect(res.statusCode).toBe(401);
    });
  });
});
