const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/db');

afterAll(async () => {
  await db.end();
});

describe('GET /api/cars', () => {
  it('should return list of available cars', async () => {
    const res = await request(app).get('/api/cars');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should filter by location', async () => {
    const res = await request(app).get('/api/cars?location=Bangkok');
    expect(res.statusCode).toBe(200);
    res.body.forEach(car => expect(car.location).toBe('Bangkok'));
  });

  it('should filter by type', async () => {
    const res = await request(app).get('/api/cars?type=sedan');
    expect(res.statusCode).toBe(200);
    res.body.forEach(car => expect(car.type).toBe('sedan'));
  });
  it('should filter by location and type', async () => {
    const res = await request(app).get('/api/cars?location=Bangkok&type=sedan');
    expect(res.statusCode).toBe(200);
    res.body.forEach(car => {
      expect(car.location).toBe('Bangkok');
      expect(car.type).toBe('sedan');
    });
  });

  it('should return empty list for non-matching filters', async () => {
    const res = await request(app).get('/api/cars?location=NonExistent');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });
});

describe('GET /api/cars/:id', () => {
  it('should return car by id', async () => {
    const res = await request(app).get('/api/cars/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
  });

  it('should return 404 for non-existent car', async () => {
    const res = await request(app).get('/api/cars/9999');
    expect(res.statusCode).toBe(404);
  });
});
