import { 
  createUser, 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  regeneratePassword,
  createInstitute,
  getInstitutes,
  getInstituteById,
  updateInstitute,
  deleteInstitute
} from '../../src/services/admin.service.js';
import User from '../../src/models/User.model.js';
import Institute from '../../src/models/Institute.model.js';
import { createTestUser } from '../setup.js';

describe('Admin Service', () => {
  describe('User Management', () => {
    describe('createUser', () => {
      it('should create institute user with generated credentials', async () => {
        const userData = {
          role: 'institute',
          instituteId: 'INST789012',
          instituteName: 'Test University',
          instituteType: 'engineering',
          fullName: 'Test Institute Admin',
          email: 'admin@testuniv.edu'
        };

        const result = await createUser(userData);
        
        expect(result).toHaveProperty('message', 'User created successfully');
        expect(result.user).toHaveProperty('userId');
        expect(result.user.role).toBe('institute');
        expect(result.user.instituteId).toBe('INST789012');
        expect(result.user.instituteName).toBe('Test University');
        expect(result.user.generatedPassword).toBeDefined();
        
        // Verify user was saved to database
        const savedUser = await User.findOne({ userId: result.user.userId });
        expect(savedUser).toBeDefined();
        expect(savedUser.instituteType).toBe('engineering');
      });

      it('should create admin user', async () => {
        const userData = {
          role: 'admin',
          fullName: 'System Admin',
          email: 'admin@system.com'
        };

        const result = await createUser(userData);
        
        expect(result.user.role).toBe('admin');
        expect(result.user.userId).toMatch(/^ADMN/);
      });

      it('should throw error for institute user without institute details', async () => {
        const userData = {
          role: 'institute',
          fullName: 'Test User',
          email: 'test@example.com'
          // Missing instituteId and instituteName
        };

        await expect(createUser(userData))
          .rejects.toThrow('Institute ID and name are required for institute users');
      });
    });

    describe('getUsers', () => {
      it('should return all users without sensitive data', async () => {
        await createTestUser(User, { userId: 'USER1', role: 'institute' });
        await createTestUser(User, { userId: 'USER2', role: 'admin' });

        const users = await getUsers();
        
        expect(users).toHaveLength(2);
        // Check that sensitive fields are not included in the response
        users.forEach(user => {
          // Check that sensitive fields are not present in the object
          expect(user.password).toBeUndefined();
          expect(user.otpCode).toBeUndefined();
          expect(user.passwordResetToken).toBeUndefined();
        });
        
        const userIds = users.map(u => u.userId);
        expect(userIds).toContain('USER1');
        expect(userIds).toContain('USER2');
      });

      it('should return empty array when no users exist', async () => {
        const users = await getUsers();
        expect(users).toHaveLength(0);
      });
    });

    describe('getUserById', () => {
      it('should return user by userId', async () => {
        await createTestUser(User, { 
          userId: 'FINDME123',
          fullName: 'Test User',
          email: 'find@test.com'
        });

        const user = await getUserById('FINDME123');
        
        expect(user.userId).toBe('FINDME123');
        expect(user.fullName).toBe('Test User');
        expect(user.email).toBe('find@test.com');
        // Check that sensitive fields are not included
        expect(user.password).toBeUndefined();
        expect(user.otpCode).toBeUndefined();
        expect(user.passwordResetToken).toBeUndefined();
      });

      it('should throw error for non-existent user', async () => {
        await expect(getUserById('NONEXISTENT'))
          .rejects.toThrow('User not found');
      });
    });

    describe('updateUser', () => {
      it('should update user information', async () => {
        await createTestUser(User, { 
          userId: 'UPDATE123',
          fullName: 'Old Name',
          email: 'old@test.com'
        });

        const updateData = {
          fullName: 'New Name',
          email: 'new@test.com'
        };

        const updatedUser = await updateUser('UPDATE123', updateData);
        
        expect(updatedUser.fullName).toBe('New Name');
        expect(updatedUser.email).toBe('new@test.com');
        
        // Verify in database
        const dbUser = await User.findOne({ userId: 'UPDATE123' });
        expect(dbUser.fullName).toBe('New Name');
      });

      it('should not update restricted fields', async () => {
        await createTestUser(User, { 
          userId: 'RESTRICT123',
          password: 'OldPassword'
        });

        const updateData = {
          password: 'NewPassword', // Should not be updated via this method
          someOtherField: 'value' // Should be ignored
        };

        const updatedUser = await updateUser('RESTRICT123', updateData);
        
        // Password should not be changed
        const dbUser = await User.findOne({ userId: 'RESTRICT123' });
        expect(dbUser.password).not.toBe('NewPassword');
      });

      it('should throw error for non-existent user', async () => {
        await expect(updateUser('NONEXISTENT', { fullName: 'New Name' }))
          .rejects.toThrow('User not found');
      });
    });

    describe('deleteUser', () => {
      it('should delete user by userId', async () => {
        await createTestUser(User, { userId: 'DELETE123' });

        const result = await deleteUser('DELETE123');
        
        expect(result).toHaveProperty('message', 'User deleted successfully');
        
        // Verify user is deleted
        const dbUser = await User.findOne({ userId: 'DELETE123' });
        expect(dbUser).toBeNull();
      });

      it('should throw error for non-existent user', async () => {
        await expect(deleteUser('NONEXISTENT'))
          .rejects.toThrow('User not found');
      });
    });

    describe('regeneratePassword', () => {
      it('should generate new password for user', async () => {
        await createTestUser(User, { 
          userId: 'REGPASS123',
          fullName: 'Test User'
        });

        const result = await regeneratePassword('REGPASS123');
        
        expect(result).toHaveProperty('message', 'Password regenerated successfully');
        expect(result).toHaveProperty('generatedPassword');
        expect(result.userId).toBe('REGPASS123');
        expect(result.fullName).toBe('Test User');
        
        // Verify password was updated
        const dbUser = await User.findOne({ userId: 'REGPASS123' });
        expect(dbUser.generatedPassword).toBe(result.generatedPassword);
      });

      it('should throw error for non-existent user', async () => {
        await expect(regeneratePassword('NONEXISTENT'))
          .rejects.toThrow('User not found');
      });
    });
  });

  describe('Institute Management', () => {
    describe('createInstitute', () => {
      it('should create new institute with generated ID', async () => {
        const instituteData = {
          name: 'Test University',
          type: 'University',
          category: 'Engineering',
          location: {
            city: 'Test City',
            state: 'Test State'
          },
          establishedYear: 2000,
          accreditation: 'A+',
          contact: {
            phone: '1234567890',
            email: 'contact@testuniv.edu'
          }
        };

        const result = await createInstitute(instituteData);
        
        expect(result).toHaveProperty('message', 'Institute created successfully');
        expect(result.institute).toHaveProperty('instituteId');
        expect(result.institute.name).toBe('Test University');
        expect(result.institute.type).toBe('University');
        expect(result.institute.isActive).toBe(true);
        expect(result.institute.instituteId).toMatch(/^INST\d{6}$/);
      });

      it('should create institute with default values', async () => {
        const instituteData = {
          name: 'Simple Institute'
        };

        const result = await createInstitute(instituteData);
        
        expect(result.institute.category).toBe('Others');
        expect(result.institute.location.city).toBe('Unknown');
        expect(result.institute.location.state).toBe('Unknown');
        expect(result.institute.isActive).toBe(true);
      });
    });

    describe('getInstitutes', () => {
      it('should return all institutes', async () => {
        await Institute.create({
          instituteId: 'INST001',
          name: 'Institute 1',
          type: 'University',
          isActive: true,
          location: {
            city: 'Test City',
            state: 'Test State'
          }
        });

        await Institute.create({
          instituteId: 'INST002',
          name: 'Institute 2',
          type: 'College',
          isActive: true,
          location: {
            city: 'Test City',
            state: 'Test State'
          }
        });

        const institutes = await getInstitutes();
        
        expect(institutes).toHaveLength(2);
        expect(institutes[0].name).toBe('Institute 1');
        expect(institutes[1].name).toBe('Institute 2');
      });

      it('should return empty array when no institutes exist', async () => {
        const institutes = await getInstitutes();
        expect(institutes).toHaveLength(0);
      });
    });

    describe('getInstituteById', () => {
      it('should return institute by instituteId', async () => {
        await Institute.create({
          instituteId: 'FINDINST',
          name: 'Find Me Institute',
          type: 'University',
          isActive: true,
          location: {
            city: 'Test City',
            state: 'Test State'
          }
        });

        const institute = await getInstituteById('FINDINST');
        
        expect(institute.instituteId).toBe('FINDINST');
        expect(institute.name).toBe('Find Me Institute');
      });

      it('should throw error for non-existent institute', async () => {
        await expect(getInstituteById('NONEXISTENT'))
          .rejects.toThrow('Institute not found');
      });
    });

    describe('updateInstitute', () => {
      it('should update institute information', async () => {
        await Institute.create({
          instituteId: 'UPDATEINST',
          name: 'Old Name',
          type: 'College',
          isActive: true,
          location: {
            city: 'Test City',
            state: 'Test State'
          }
        });

        const updateData = {
          name: 'New Name',
          type: 'University',
          isActive: false
        };

        const updatedInstitute = await updateInstitute('UPDATEINST', updateData);
        
        expect(updatedInstitute.name).toBe('New Name');
        expect(updatedInstitute.type).toBe('University');
        expect(updatedInstitute.isActive).toBe(false);
      });

      it('should throw error for non-existent institute', async () => {
        await expect(updateInstitute('NONEXISTENT', { name: 'New Name' }))
          .rejects.toThrow('Institute not found');
      });
    });

    describe('deleteInstitute', () => {
      it('should delete institute by instituteId', async () => {
        await Institute.create({
          instituteId: 'DELETEINST',
          name: 'Delete Me',
          type: 'College',
          isActive: true,
          location: {
            city: 'Test City',
            state: 'Test State'
          }
        });

        const result = await deleteInstitute('DELETEINST');
        
        expect(result).toHaveProperty('message', 'Institute deleted successfully');
        
        // Verify institute is deleted
        const dbInstitute = await Institute.findOne({ instituteId: 'DELETEINST' });
        expect(dbInstitute).toBeNull();
      });

      it('should throw error for non-existent institute', async () => {
        await expect(deleteInstitute('NONEXISTENT'))
          .rejects.toThrow('Institute not found');
      });
    });
  });
});
