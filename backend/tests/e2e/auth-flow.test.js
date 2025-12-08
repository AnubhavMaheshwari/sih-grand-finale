import request from 'supertest';
import express from 'express';
import routes from '../../src/routes/index.js';
import User from '../../src/models/User.model.js';
import { createTestUser } from '../setup.js';

const app = express();
app.use(express.json());
app.use('/api', routes);

describe('End-to-End Auth Flow Tests', () => {
  describe('Complete Password Reset Flow', () => {
    it('should complete full password reset flow for institute user', async () => {
      // 1. Create test institute user
      await createTestUser(User, {
        userId: 'E2ETEST',
        password: 'OldPassword@123',
        email: 'e2e@institute.edu',
        role: 'institute'
      });

      // 2. Login with old password (should work) - using institute login endpoint
      const loginResponse = await request(app)
        .post('/api/auth/institute/login')
        .send({
          userId: 'E2ETEST',
          password: 'OldPassword@123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);

      // 3. Request password reset (forgot password)
      const forgotResponse = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'e2e@institute.edu'
        });

      expect(forgotResponse.status).toBe(200);
      expect(forgotResponse.body.success).toBe(true);

      // 4. Get OTP from user (in real scenario, would check email)
      const user = await User.findOne({ email: 'e2e@institute.edu' });
      const otpCode = user.otpCode;
      expect(otpCode).toBeDefined();

      // 5. Verify OTP
      const verifyResponse = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'e2e@institute.edu',
          otpCode
        });

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);
      const resetToken = verifyResponse.body.data.resetToken;
      expect(resetToken).toBeDefined();

      // 6. Reset password with new password
      const resetResponse = await request(app)
        .post('/api/auth/reset-password')
        .send({
          resetToken,
          newPassword: 'NewPassword@456'
        });

      expect(resetResponse.status).toBe(200);
      expect(resetResponse.body.success).toBe(true);

      // 7. Verify old password no longer works
      const failedLoginResponse = await request(app)
        .post('/api/auth/institute/login')
        .send({
          userId: 'E2ETEST',
          password: 'OldPassword@123'
        });

      expect(failedLoginResponse.status).toBe(400);
      expect(failedLoginResponse.body.success).toBe(false);

      // 8. Login with new password (should work)
      const newLoginResponse = await request(app)
        .post('/api/auth/institute/login')
        .send({
          userId: 'E2ETEST',
          password: 'NewPassword@456'
        });

      expect(newLoginResponse.status).toBe(200);
      expect(newLoginResponse.body.success).toBe(true);

      // 9. Verify reset fields are cleared
      const updatedUser = await User.findOne({ email: 'e2e@institute.edu' });
      expect(updatedUser.otpCode).toBeNull();
      expect(updatedUser.otpExpiresAt).toBeNull();
      expect(updatedUser.passwordResetToken).toBeNull();
      expect(updatedUser.passwordResetExpires).toBeNull();
      expect(updatedUser.lastPasswordReset).toBeDefined();
    });

    it('should handle account lockout and reset flow', async () => {
      // Create test user
      await createTestUser(User, {
        userId: 'LOCKFLOW',
        password: 'Correct@123',
        email: 'lockflow@institute.edu',
        role: 'institute'
      });

      // Attempt 5 failed logins
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/auth/institute/login')
          .send({
            userId: 'LOCKFLOW',
            password: 'WrongPassword'
          });
        expect(response.status).toBe(400);
      }

      // 6th attempt should be locked
      const lockedResponse = await request(app)
        .post('/api/auth/institute/login')
        .send({
          userId: 'LOCKFLOW',
          password: 'WrongPassword'
        });

      expect(lockedResponse.status).toBe(400);
      expect(lockedResponse.body.message).toMatch(/Account is locked/);

      // Request password reset should still work
      const forgotResponse = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'lockflow@institute.edu'
        });

      expect(forgotResponse.status).toBe(200);

      // Get OTP and verify
      const user = await User.findOne({ email: 'lockflow@institute.edu' });
      const otpCode = user.otpCode;

      const verifyResponse = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'lockflow@institute.edu',
          otpCode
        });

      expect(verifyResponse.status).toBe(200);
      const resetToken = verifyResponse.body.data.resetToken;

      // Reset password (should also clear lockout)
      const resetResponse = await request(app)
        .post('/api/auth/reset-password')
        .send({
          resetToken,
          newPassword: 'NewUnlock@123'
        });

      expect(resetResponse.status).toBe(200);

      // Login with new password should work (lockout cleared)
      const loginResponse = await request(app)
        .post('/api/auth/institute/login')
        .send({
          userId: 'LOCKFLOW',
          password: 'NewUnlock@123'
        });

      expect(loginResponse.status).toBe(200);

      // Verify lockout fields are cleared
      const updatedUser = await User.findOne({ email: 'lockflow@institute.edu' });
      expect(updatedUser.loginAttempts).toBe(0);
      expect(updatedUser.lockUntil).toBeNull();
    });

    it('should prevent password reset for admin users', async () => {
      // Create admin user
      await createTestUser(User, {
        userId: 'ADMINFLOW',
        password: 'Admin@123',
        email: 'admin@system.com',
        role: 'admin'
      });

      // Admin should not be able to use forgot password
      const forgotResponse = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'admin@system.com'
        });

      expect(forgotResponse.status).toBe(400);
      expect(forgotResponse.body.message).toBe('Password reset is only available for institute accounts');

      // Admin should still be able to login - using admin login endpoint
      const loginResponse = await request(app)
        .post('/api/auth/admin/login')
        .send({
          userId: 'ADMINFLOW',
          password: 'Admin@123'
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should handle OTP expiration and retry', async () => {
      // Create user with expired OTP
      await createTestUser(User, {
        userId: 'EXPIREDOTP',
        password: 'Test@123',
        email: 'expired@institute.edu',
        role: 'institute',
        otpCode: '123456',
        otpExpiresAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      });

      // Try to verify expired OTP
      const verifyResponse = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'expired@institute.edu',
          otpCode: '123456'
        });

      expect(verifyResponse.status).toBe(400);
      expect(verifyResponse.body.message).toMatch(/OTP has expired/);

      // Request new OTP
      const forgotResponse = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'expired@institute.edu'
        });

      expect(forgotResponse.status).toBe(200);

      // Get new OTP and verify
      const user = await User.findOne({ email: 'expired@institute.edu' });
      const newOtpCode = user.otpCode;

      const newVerifyResponse = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'expired@institute.edu',
          otpCode: newOtpCode
        });

      expect(newVerifyResponse.status).toBe(200);
    });
  });
});
