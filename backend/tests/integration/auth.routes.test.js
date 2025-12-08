import request from 'supertest';
import express from 'express';
import routes from '../../src/routes/index.js';
import User from '../../src/models/User.model.js';
import { createTestUser } from '../setup.js';

const app = express();
app.use(express.json());
app.use('/api', routes);

describe('Auth Routes Integration Tests', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestUser(User, {
        userId: 'LOGINTEST',
        password: 'Test@123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userId: 'LOGINTEST',
          password: 'Test@123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.userId).toBe('LOGINTEST');
      expect(response.body.data.message).toBe('Login successful');
    });

    it('should return error for invalid credentials', async () => {
      await createTestUser(User, {
        userId: 'LOGINTEST',
        password: 'Test@123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userId: 'LOGINTEST',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return error for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userId: 'LOGINTEST'
          // Missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User ID and password are required');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send OTP for institute user', async () => {
      await createTestUser(User, {
        email: 'institute@test.edu',
        role: 'institute'
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'institute@test.edu'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message', 'OTP sent to your email address');
      expect(response.body.data.email).toBe('institute@test.edu');
    });

    it('should return error for admin user', async () => {
      await createTestUser(User, {
        email: 'admin@test.com',
        role: 'admin'
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'admin@test.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Password reset is only available for institute accounts');
    });

    it('should return error for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@test.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No account found with this email address');
    });

    it('should return error for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email is required');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should verify valid OTP', async () => {
      await createTestUser(User, {
        email: 'verify@test.edu',
        role: 'institute',
        otpCode: '123456',
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'verify@test.edu',
          otpCode: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message', 'OTP verified successfully');
      expect(response.body.data).toHaveProperty('resetToken');
    });

    it('should return error for invalid OTP', async () => {
      await createTestUser(User, {
        email: 'verify@test.edu',
        role: 'institute',
        otpCode: '123456',
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'verify@test.edu',
          otpCode: '999999'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid OTP');
    });

    it('should return error for expired OTP', async () => {
      await createTestUser(User, {
        email: 'verify@test.edu',
        role: 'institute',
        otpCode: '123456',
        otpExpiresAt: new Date(Date.now() - 10 * 60 * 1000) // Expired
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'verify@test.edu',
          otpCode: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('OTP has expired. Please request a new one.');
    });

    it('should return error for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'test@example.com'
          // Missing otpCode
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email and OTP code are required');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const resetToken = 'valid-reset-token-123';
      await createTestUser(User, {
        email: 'reset@test.edu',
        role: 'institute',
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 30 * 60 * 1000)
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          resetToken,
          newPassword: 'NewPassword@123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message', 'Password reset successfully');
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          resetToken: 'invalid-token',
          newPassword: 'NewPassword@123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    it('should return error for short password', async () => {
      const resetToken = 'valid-token';
      await createTestUser(User, {
        email: 'reset@test.edu',
        role: 'institute',
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 30 * 60 * 1000)
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          resetToken,
          newPassword: 'short'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Password must be at least 8 characters long');
    });

    it('should return error for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          resetToken: 'some-token'
          // Missing newPassword
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Reset token and new password are required');
    });
  });
});
