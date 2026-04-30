const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/db');

afterAll(async () => {
  await db.query('DELETE FROM users WHERE email = ?', ['jest@test.com']);
  await db.end();
});

describe('POST /api/auth/register', () => {
  it('should register successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jest User', email: 'jest@test.com', password: '123456' });
    expect(res.statusCode).toBe(201);
  });

  it('should fail if fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'missing@test.com' });
    expect(res.statusCode).toBe(400);
  });

  it('should fail if email already exists', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jest User', email: 'jest@test.com', password: '123456' });
    expect(res.statusCode).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  it('should login successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jest@test.com', password: '123456' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jest@test.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });

  it('should fail with non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'password' });
    expect(res.statusCode).toBe(401);
  });

  it('should fail with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jest@test.com' });
    expect(res.statusCode).toBe(400);
  });
});
