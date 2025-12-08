import { loginUser, forgotPassword, verifyOTP, resetPassword, canRequestOTP } from '../../src/services/auth.service.js';
import User from '../../src/models/User.model.js';
import { createTestUser } from '../setup.js';

describe('Auth Service', () => {
  describe('loginUser', () => {
    it('should login user with valid credentials', async () => {
      const user = await createTestUser(User, {
        userId: 'TESTLOGIN',
        password: 'Test@123'
      });

      const result = await loginUser('TESTLOGIN', 'Test@123');
      
      expect(result).toHaveProperty('token');
      expect(result.user.userId).toBe('TESTLOGIN');
      expect(result.user.role).toBe('institute');
      expect(result.message).toBe('Login successful');
    });

    it('should throw error for invalid credentials', async () => {
      await createTestUser(User, {
        userId: 'TESTLOGIN',
        password: 'Test@123'
      });

      await expect(loginUser('TESTLOGIN', 'WrongPassword'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should lock account after 5 failed attempts', async () => {
      const user = await createTestUser(User, {
        userId: 'LOCKTEST',
        password: 'Test@123'
      });

      // Attempt 5 failed logins
      for (let i = 0; i < 5; i++) {
        try {
          await loginUser('LOCKTEST', 'WrongPassword');
        } catch (error) {
          // Expected to fail
        }
      }

      // 6th attempt should show account locked
      await expect(loginUser('LOCKTEST', 'WrongPassword'))
        .rejects.toThrow(/Account is locked/);
    });

    it('should reset login attempts on successful login', async () => {
      const user = await createTestUser(User, {
        userId: 'RESETTEST',
        password: 'Test@123',
        loginAttempts: 3
      });

      const result = await loginUser('RESETTEST', 'Test@123');
      
      const updatedUser = await User.findOne({ userId: 'RESETTEST' });
      expect(updatedUser.loginAttempts).toBe(0);
      expect(updatedUser.lockUntil).toBeNull();
    });
  });

  describe('forgotPassword', () => {
    it('should send OTP to institute user email', async () => {
      const user = await createTestUser(User, {
        email: 'test@institute.edu',
        role: 'institute'
      });

      const result = await forgotPassword('test@institute.edu');
      
      expect(result).toHaveProperty('message', 'OTP sent to your email address');
      expect(result).toHaveProperty('email', 'test@institute.edu');
      expect(result).toHaveProperty('expiresIn');

      // Check OTP was saved to user
      const updatedUser = await User.findOne({ email: 'test@institute.edu' });
      expect(updatedUser.otpCode).toBeDefined();
      expect(updatedUser.otpExpiresAt).toBeDefined();
    });

    it('should throw error for non-institute users', async () => {
      const user = await createTestUser(User, {
        email: 'admin@test.com',
        role: 'admin'
      });

      await expect(forgotPassword('admin@test.com'))
        .rejects.toThrow('Password reset is only available for institute accounts');
    });

    it('should throw error for non-existent email', async () => {
      await expect(forgotPassword('nonexistent@test.com'))
        .rejects.toThrow('No account found with this email address');
    });
  });

  describe('verifyOTP', () => {
    it('should verify valid OTP and return reset token', async () => {
      const user = await createTestUser(User, {
        email: 'test@institute.edu',
        role: 'institute',
        otpCode: '123456',
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      });

      const result = await verifyOTP('test@institute.edu', '123456');
      
      expect(result).toHaveProperty('message', 'OTP verified successfully');
      expect(result).toHaveProperty('resetToken');
      expect(result).toHaveProperty('expiresIn', 30);

      // Check reset token was saved
      const updatedUser = await User.findOne({ email: 'test@institute.edu' });
      expect(updatedUser.passwordResetToken).toBeDefined();
      expect(updatedUser.passwordResetExpires).toBeDefined();
    });

    it('should throw error for invalid OTP', async () => {
      const user = await createTestUser(User, {
        email: 'test@institute.edu',
        role: 'institute',
        otpCode: '123456',
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });

      await expect(verifyOTP('test@institute.edu', '999999'))
        .rejects.toThrow('Invalid OTP');
    });

    it('should throw error for expired OTP', async () => {
      const user = await createTestUser(User, {
        email: 'test@institute.edu',
        role: 'institute',
        otpCode: '123456',
        otpExpiresAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      });

      await expect(verifyOTP('test@institute.edu', '123456'))
        .rejects.toThrow('OTP has expired');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid reset token', async () => {
      const resetToken = 'valid-reset-token-123';
      const user = await createTestUser(User, {
        email: 'test@institute.edu',
        role: 'institute',
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      });

      const newPassword = 'NewPassword@123';
      const result = await resetPassword(resetToken, newPassword);
      
      expect(result).toHaveProperty('message', 'Password reset successfully');
      expect(result).toHaveProperty('userId', user.userId);
      expect(result).toHaveProperty('email', 'test@institute.edu');

      // Check password was updated and reset fields cleared
      const updatedUser = await User.findOne({ email: 'test@institute.edu' });
      expect(updatedUser.passwordResetToken).toBeNull();
      expect(updatedUser.passwordResetExpires).toBeNull();
      expect(updatedUser.otpCode).toBeNull();
      expect(updatedUser.otpExpiresAt).toBeNull();
      expect(updatedUser.lastPasswordReset).toBeDefined();
    });

    it('should throw error for invalid reset token', async () => {
      await expect(resetPassword('invalid-token', 'NewPassword@123'))
        .rejects.toThrow('Invalid or expired reset token');
    });

    it('should throw error for expired reset token', async () => {
      const resetToken = 'expired-reset-token';
      await createTestUser(User, {
        email: 'test@institute.edu',
        role: 'institute',
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      });

      await expect(resetPassword(resetToken, 'NewPassword@123'))
        .rejects.toThrow('Invalid or expired reset token');
    });

    it('should throw error for password less than 8 characters', async () => {
      const resetToken = 'valid-reset-token';
      await createTestUser(User, {
        email: 'test@institute.edu',
        role: 'institute',
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 30 * 60 * 1000)
      });

      await expect(resetPassword(resetToken, 'short'))
        .rejects.toThrow('Password must be at least 8 characters long');
    });
  });

  describe('canRequestOTP', () => {
    it('should allow OTP request for user without existing OTP', async () => {
      const user = await createTestUser(User, {
        email: 'test@institute.edu',
        role: 'institute'
      });

      const result = await canRequestOTP('test@institute.edu');
      expect(result.canRequest).toBe(true);
    });

    it('should prevent OTP request if recent OTP exists', async () => {
      const user = await createTestUser(User, {
        email: 'test@institute.edu',
        role: 'institute',
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
      });

      const result = await canRequestOTP('test@institute.edu');
      expect(result.canRequest).toBe(false);
      expect(result.message).toMatch(/Please wait/);
    });

    it('should allow OTP request for non-existent email', async () => {
      const result = await canRequestOTP('nonexistent@test.com');
      expect(result.canRequest).toBe(true);
    });
  });
});
