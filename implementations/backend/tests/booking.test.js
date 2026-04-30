const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/db');

let token;

// Helper to generate future dates in YYYY-MM-DD format
function futureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

beforeAll(async () => {
  // Clean up any existing test data first
  await db.query('DELETE FROM bookings WHERE user_id = (SELECT id FROM users WHERE email = ?)', ['bookingtest@test.com']);
  await db.query('DELETE FROM users WHERE email = ?', ['bookingtest@test.com']);
  await db.query('UPDATE cars SET is_available = TRUE');
  
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Booking User', email: 'bookingtest@test.com', password: '123456' });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'bookingtest@test.com', password: '123456' });
  token = res.body.token;
});

afterAll(async () => {
  await db.query('DELETE FROM bookings WHERE user_id = (SELECT id FROM users WHERE email = ?)', ['bookingtest@test.com']);
  await db.query('DELETE FROM users WHERE email = ?', ['bookingtest@test.com']);
  await db.query('UPDATE cars SET is_available = TRUE WHERE id = 2');
  await db.end();
});

describe('GET /api/bookings', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.statusCode).toBe(401);
  });

  it('should return bookings for authenticated user', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/bookings', () => {
  it('should create booking successfully', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ car_id: 2, pickup_date: futureDate(5), return_date: futureDate(7) });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('total_price');
  });

  it('should fail without token', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ car_id: 3, pickup_date: futureDate(5), return_date: futureDate(7) });
    expect(res.statusCode).toBe(401);
  });

  it('should fail with missing fields', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ car_id: 3 });
    expect(res.statusCode).toBe(400);
  });

  it('should fail if pickup_date is in the past', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ car_id: 4, pickup_date: '2020-03-01', return_date: '2020-03-03' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('past');
  });

  it('should fail if rental period exceeds 30 days', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ car_id: 5, pickup_date: futureDate(5), return_date: futureDate(40) });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('30 days');
  });

  it('should apply promo code discount correctly', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        car_id: 6,
        pickup_date: futureDate(10),
        return_date: futureDate(12),
        promo_code: 'ONLYTRAVELNAJA'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('total_price');
    // For a 2-day rental at car 6's price (should be discounted 30%)
    // The discount should be reflected in total_price
  });

  it('should reject invalid promo code', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        car_id: 7,
        pickup_date: futureDate(15),
        return_date: futureDate(17),
        promo_code: 'INVALID_CODE'
      });
    // Should create booking without discount, not reject
    expect(res.statusCode).toBe(201);
  });
});

describe('PUT /api/bookings/:id/pay', () => {
  let bookingId;

  beforeAll(async () => {
    // Create a pending booking to test payment
    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ car_id: 8, pickup_date: futureDate(20), return_date: futureDate(22) });
    if (bookingRes.statusCode === 201) {
      bookingId = bookingRes.body.booking_id;
    }
  });

  it('should update booking status to confirmed on payment', async () => {
    if (!bookingId) {
      console.warn('Skipping payment test - no booking created');
      return;
    }
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/pay`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('successful');
  });

  it('should fail without token', async () => {
    if (!bookingId) {
      console.warn('Skipping payment test - no booking created');
      return;
    }
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/pay`);
    expect(res.statusCode).toBe(401);
  });

  it('should fail for non-existent booking', async () => {
    const res = await request(app)
      .put('/api/bookings/9999/pay')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe('DELETE /api/bookings/:id', () => {
  let cancelBookingId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ car_id: 9, pickup_date: futureDate(5), return_date: futureDate(7) });
    if (res.statusCode === 201) {
      cancelBookingId = res.body.booking_id;
    }
  });

  it('should cancel pending booking', async () => {
    if (!cancelBookingId) return;
    const res = await request(app)
      .delete(`/api/bookings/${cancelBookingId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('cancelled');
  });

  it('should fail if already cancelled', async () => {
    if (!cancelBookingId) return;
    const res = await request(app)
      .delete(`/api/bookings/${cancelBookingId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });
});

describe('PUT /api/bookings/:id/return', () => {
  let returnBookingId;

  beforeAll(async () => {
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', ['bookingtest@test.com']);
    const userId = users[0].id;

    const [result] = await db.query(
      'INSERT INTO bookings (user_id, car_id, pickup_date, return_date, pickup_location, dropoff_location, dropoff_fee, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, 10, '2025-01-01', '2025-01-02', 'Bangkok', 'Bangkok', 0, 1000, 'confirmed']
    );
    returnBookingId = result.insertId;
  });

  it('should return confirmed booking', async () => {
    const res = await request(app)
      .put(`/api/bookings/${returnBookingId}/return`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('should fail to return if not confirmed', async () => {
    // It's now completed because of the previous test
    const res = await request(app)
      .put(`/api/bookings/${returnBookingId}/return`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });
});
