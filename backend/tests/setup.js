import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

let mongod;

// Mock nodemailer to prevent actual email sending
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      response: '250 OK',
      messageId: 'test-message-id'
    })
  })
}));

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';
process.env.ADMIN_USER_ID = 'ADMIN123456';
process.env.ADMIN_PASSWORD = 'Admin@123';

beforeAll(async () => {
  // Start MongoDB memory server
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(uri);
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany();
  }
  
  // Clear all mocks
  jest.clearAllMocks();
});

afterAll(async () => {
  // Disconnect from database and stop MongoDB memory server
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

// Helper function to create test user
export const createTestUser = async (User, userData = {}) => {
  const defaultUser = {
    userId: 'TEST123456',
    password: 'Test@123',
    role: 'institute',
    instituteId: 'INST123456',
    instituteName: 'Test Institute',
    fullName: 'Test User',
    email: 'test@example.com',
  };
  
  const user = new User({ ...defaultUser, ...userData });
  await user.save();
  return user;
};

// Helper function to generate JWT token
export const generateTestToken = (userData = {}) => {
  const payload = {
    id: 'test-id',
    userId: 'TEST123456',
    role: 'institute',
    fullName: 'Test User',
    ...userData
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};
