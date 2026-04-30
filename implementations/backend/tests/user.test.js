const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/db');

let userToken;

beforeAll(async () => {
  await db.query('DELETE FROM users WHERE email = ?', ['usertest@test.com']);
  
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'User Test', email: 'usertest@test.com', password: 'password123' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'usertest@test.com', password: 'password123' });
  userToken = loginRes.body.token;
});

afterAll(async () => {
  await db.query('DELETE FROM users WHERE email = ?', ['usertest@test.com']);
  await db.end();
});

describe('User Profile Endpoints', () => {
  describe('GET /api/users/profile', () => {
    it('should get user profile successfully', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('usertest@test.com');
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/users/profile');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update profile successfully', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profile updated successfully');
    });

    it('should fail if name is empty', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '' });
      expect(res.statusCode).toBe(400);
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({ name: 'Some Name' });
      expect(res.statusCode).toBe(401);
    });
  });
});
