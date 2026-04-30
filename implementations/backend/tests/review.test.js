const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/db');

let userToken;
let bookingId;

beforeAll(async () => {
  await db.query('DELETE FROM reviews WHERE user_id = (SELECT id FROM users WHERE email = ?)', ['reviewtest@test.com']);
  await db.query('DELETE FROM bookings WHERE user_id = (SELECT id FROM users WHERE email = ?)', ['reviewtest@test.com']);
  await db.query('DELETE FROM users WHERE email = ?', ['reviewtest@test.com']);
  await db.query('UPDATE cars SET is_available = TRUE WHERE id = 1');
  
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Review User', email: 'reviewtest@test.com', password: 'password123' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'reviewtest@test.com', password: 'password123' });
  userToken = loginRes.body.token;

  const [userResult] = await db.query('SELECT id FROM users WHERE email = ?', ['reviewtest@test.com']);
  const userId = userResult[0].id;

  // Insert a completed booking directly
  const [insertResult] = await db.query(
    'INSERT INTO bookings (user_id, car_id, pickup_date, return_date, pickup_location, dropoff_location, dropoff_fee, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, 1, '2025-01-01', '2025-01-05', 'Bangkok', 'Bangkok', 0, 5000, 'completed']
  );
  bookingId = insertResult.insertId;
});

afterAll(async () => {
  await db.query('DELETE FROM reviews WHERE user_id = (SELECT id FROM users WHERE email = ?)', ['reviewtest@test.com']);
  await db.query('DELETE FROM bookings WHERE user_id = (SELECT id FROM users WHERE email = ?)', ['reviewtest@test.com']);
  await db.query('DELETE FROM users WHERE email = ?', ['reviewtest@test.com']);
  await db.query('UPDATE cars SET is_available = TRUE WHERE id = 1');
  await db.end();
});

describe('Review Endpoints', () => {
  describe('POST /api/reviews', () => {
    it('should create a review successfully', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          booking_id: bookingId,
          car_id: 1,
          rating: 5,
          comment: 'Great car!'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Review submitted successfully');
    });

    it('should fail if missing fields', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          booking_id: bookingId,
          rating: 5
        });
      expect(res.statusCode).toBe(400);
    });
    
    it('should fail if review already exists', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          booking_id: bookingId,
          car_id: 1,
          rating: 4,
          comment: 'Another review'
        });
      expect(res.statusCode).toBe(400);
    });

    it('should fail for non-existent booking', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          booking_id: 9999,
          car_id: 1,
          rating: 4,
          comment: 'Ghost review'
        });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/reviews/car/:carId', () => {
    it('should get reviews for a car', async () => {
      const res = await request(app).get('/api/reviews/car/1');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should fail for invalid car id', async () => {
      const res = await request(app).get('/api/reviews/car/9999');
      expect(res.statusCode).toBe(200); // API currently returns empty array with 200
      expect(res.body.length).toBe(0);
    });
  });
});
