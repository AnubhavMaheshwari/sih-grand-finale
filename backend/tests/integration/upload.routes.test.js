/**
 * Jest integration tests for upload routes
 */

import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../../server.js';
import UploadedDocument from '../../src/models/UploadedDocument.model.js';
import fs from 'fs-extra';
import path from 'path';

// Mock the upload middleware
jest.mock('../../src/middleware/upload.js', () => ({
  upload: {
    single: () => (req, res, next) => {
      // Simulate file upload
      req.file = {
        originalname: 'test.csv',
        size: 1024,
        buffer: Buffer.from('test content'),
        path: '/tmp/test.csv'
      };
      next();
    },
    array: () => (req, res, next) => {
      req.files = [
        {
          originalname: 'test1.csv',
          size: 1024,
          buffer: Buffer.from('test content 1'),
          path: '/tmp/test1.csv'
        },
        {
          originalname: 'test2.xlsx',
          size: 2048,
          buffer: Buffer.from('test content 2'),
          path: '/tmp/test2.xlsx'
        }
      ];
      next();
    }
  },
  moveToInstituteDirectory: jest.fn().mockResolvedValue({
    storedFilename: 'test-stored.csv',
    filePath: '/uploads/test-institute/2025/test-stored.csv'
  })
}));

// Mock the excel parser service
jest.mock('../../src/services/excelParser.service.js', () => {
  const mockParseFile = jest.fn().mockResolvedValue({
    success: true,
    data: [
      { parameterName: 'Teacher-Student Ratio', value: '1:30', dataType: 'STRING' },
      { parameterName: 'Faculty strength', value: 50, dataType: 'INTEGER' }
    ],
    errors: [],
    warnings: [],
    userMessages: {
      critical: [],
      warning: [],
      info: ['ℹ️ INFO: 2 parameters parsed successfully'],
      success: ['✅ SUCCESS: File uploaded successfully!']
    },
    stats: {
      totalExpected: 26,
      foundCount: 2,
      missingCount: 24,
      emptyValueCount: 0,
      filledCount: 2,
      completeness: 8
    },
    summary: {
      totalRows: 2,
      validRows: 2,
      errorRows: 0,
      missingParameters: 24,
      completeness: 8
    }
  });
  
  const mockConvertToDatabaseFormat = jest.fn().mockReturnValue({
    instituteId: 'test-institute-001',
    academicYear: 2025,
    source: 'CSV_UPLOAD',
    parameters: {
      teacherStudentRatio: { value: '1:30', dataType: 'STRING', originalName: 'Teacher-Student Ratio' },
      facultyStrength: { value: 50, dataType: 'INTEGER', originalName: 'Faculty strength' }
    },
    completeness: 8,
    metadata: { totalParameters: 2 }
  });
  
  const mockSaveToDatabase = jest.fn().mockResolvedValue({
    _id: 'mock-db-id',
    instituteId: 'test-institute-001',
    academicYear: 2025,
    completeness: 8
  });
  
  return {
    default: {
      parseFile: mockParseFile,
      convertToDatabaseFormat: mockConvertToDatabaseFormat,
      saveToDatabase: mockSaveToDatabase
    }
  };
});

// Mock fs-extra
jest.mock('fs-extra', () => ({
  remove: jest.fn().mockResolvedValue(true),
  pathExists: jest.fn().mockResolvedValue(true),
  readFile: jest.fn().mockResolvedValue(Buffer.from('test content')),
  stat: jest.fn().mockResolvedValue({ size: 1024 }),
  createReadStream: jest.fn().mockReturnValue({
    pipe: jest.fn()
  })
}));

describe('Upload Routes', () => {
  let authToken;
  
  beforeAll(() => {
    // Setup test authentication token
    authToken = 'mock-jwt-token';
  });
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock UploadedDocument model methods
    UploadedDocument.prototype.save = jest.fn().mockResolvedValue({
      _id: 'mock-document-id',
      instituteId: 'test-institute-001',
      originalFilename: 'test.csv',
      storedFilename: 'test-stored.csv',
      filePath: '/uploads/test-institute/2025/test-stored.csv',
      fileSize: 1024,
      year: 2025,
      status: 'UPLOADED',
      uploadedAt: new Date()
    });
    
    UploadedDocument.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                {
                  _id: 'doc1',
                  originalFilename: 'test1.csv',
                  status: 'PARSED',
                  uploadedAt: new Date()
                }
              ])
            })
          })
        })
      })
    });
    
    UploadedDocument.countDocuments = jest.fn().mockResolvedValue(1);
    UploadedDocument.findById = jest.fn().mockResolvedValue({
      _id: 'mock-document-id',
      instituteId: 'test-institute-001',
      originalFilename: 'test.csv',
      populate: jest.fn().mockResolvedValue({
        _id: 'mock-document-id',
        instituteId: 'test-institute-001',
        originalFilename: 'test.csv'
      }),
      softDelete: jest.fn().mockResolvedValue(true)
    });
    
    UploadedDocument.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
  });
  
  describe('POST /api/upload/single', () => {
    test('should upload single file successfully', async () => {
      const response = await request(app)
        .post('/api/upload/single')
        .set('Authorization', `Bearer ${authToken}`)
        .field('instituteId', 'test-institute-001')
        .field('year', '2025')
        .attach('document', Buffer.from('test content'), 'test.csv');
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.document).toBeDefined();
      expect(response.body.data.document.originalFilename).toBe('test.csv');
      expect(response.body.data.parsedData).toBeDefined();
      expect(response.body.data.parsedData.userMessages).toBeDefined();
      expect(response.body.data.parsedData.stats).toBeDefined();
      expect(response.body.data.message).toBe('Document uploaded successfully');
    });
    
    test('should return error when instituteId is missing', async () => {
      const response = await request(app)
        .post('/api/upload/single')
        .set('Authorization', `Bearer ${authToken}`)
        .field('year', '2025')
        .attach('document', Buffer.from('test content'), 'test.csv');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Institute ID is required');
    });
    
    test('should return error when year is invalid', async () => {
      const response = await request(app)
        .post('/api/upload/single')
        .set('Authorization', `Bearer ${authToken}`)
        .field('instituteId', 'test-institute-001')
        .field('year', '1999') // Invalid year
        .attach('document', Buffer.from('test content'), 'test.csv');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Valid year is required');
    });
  });
  
  describe('POST /api/upload/multiple', () => {
    test('should upload multiple files successfully', async () => {
      const response = await request(app)
        .post('/api/upload/multiple')
        .set('Authorization', `Bearer ${authToken}`)
        .field('instituteId', 'test-institute-001')
        .field('year', '2025')
        .attach('documents', Buffer.from('test content 1'), 'test1.csv')
        .attach('documents', Buffer.from('test content 2'), 'test2.csv');
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.documents).toHaveLength(1); // Mock returns 1 document
      expect(response.body.data.successCount).toBe(1);
      expect(response.body.data.message).toContain('Successfully uploaded');
    });
  });
  
  describe('GET /api/upload/institute/:instituteId', () => {
    test('should get institute documents', async () => {
      const response = await request(app)
        .get('/api/upload/institute/test-institute-001')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.documents).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.message).toBe('Documents retrieved successfully');
    });
  });
  
  describe('GET /api/upload/:id', () => {
    test('should get single document', async () => {
      const response = await request(app)
        .get('/api/upload/mock-document-id')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.document).toBeDefined();
      expect(response.body.data.message).toBe('Document retrieved successfully');
    });
    
    test('should return 404 for non-existent document', async () => {
      UploadedDocument.findById = jest.fn().mockResolvedValue(null);
      
      const response = await request(app)
        .get('/api/upload/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Document not found');
    });
  });
  
  describe('DELETE /api/upload/:id', () => {
    test('should delete document successfully', async () => {
      const response = await request(app)
        .delete('/api/upload/mock-document-id')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Document deleted successfully');
    });
  });
  
  describe('POST /api/upload/:id/parse-parameters', () => {
    test('should parse parameter file successfully', async () => {
      const response = await request(app)
        .post('/api/upload/mock-document-id/parse-parameters')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.parseSummary).toBeDefined();
      expect(response.body.data.message).toContain('File parsed and parameter data saved');
    });
  });
  
  describe('Error handling', () => {
    test('should handle upload errors gracefully', async () => {
      // Mock an error in the upload middleware
      const { upload } = require('../../src/middleware/upload.js');
      upload.single = () => (req, res, next) => {
        next(new Error('Mock upload error'));
      };
      
      const response = await request(app)
        .post('/api/upload/single')
        .set('Authorization', `Bearer ${authToken}`)
        .field('instituteId', 'test-institute-001')
        .field('year', '2025');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Mock upload error');
    });
    
    test('should handle parsing errors gracefully', async () => {
      const excelParserService = require('../../src/services/excelParser.service.js').default;
      excelParserService.parseFile.mockRejectedValueOnce(new Error('Mock parsing error'));
      
      const response = await request(app)
        .post('/api/upload/single')
        .set('Authorization', `Bearer ${authToken}`)
        .field('instituteId', 'test-institute-001')
        .field('year', '2025')
        .attach('document', Buffer.from('test content'), 'test.csv');
      
      expect(response.status).toBe(201); // Upload still succeeds even if parsing fails
      expect(response.body.success).toBe(true);
      expect(response.body.data.document).toBeDefined();
    });
  });
});
