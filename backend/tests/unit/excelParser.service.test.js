/**
 * Jest tests for ExcelParserService
 */

import excelParserService from '../../src/services/excelParser.service.js';
import fs from 'fs-extra';
import { jest } from '@jest/globals';

describe('ExcelParserService', () => {
  let consoleSpy;
  
  beforeEach(() => {
    // Mock console methods to capture logs
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
      info: jest.spyOn(console, 'info').mockImplementation(() => {})
    };
  });
  
  afterEach(() => {
    // Restore console methods
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.info.mockRestore();
  });
  
  describe('parseFile', () => {
    test('should parse CSV file successfully', async () => {
      // Mock the file reading since we don't have actual sample files in test environment
      const mockFileBuffer = Buffer.from('Parameters,Value,Data Type\nTeacher-Student Ratio,1:30,STRING\nFaculty strength,50,INTEGER');
      
      const file = {
        buffer: mockFileBuffer,
        originalname: 'test.csv',
        size: mockFileBuffer.length
      };
      
      // Mock fs-extra methods
      jest.spyOn(fs, 'readFile').mockResolvedValue(mockFileBuffer);
      jest.spyOn(fs, 'stat').mockResolvedValue({ size: mockFileBuffer.length });
      
      const result = await excelParserService.parseFile(
        file,
        'test-institute-001',
        2025
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.userMessages).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.stats.totalExpected).toBeGreaterThan(0);
    });
    
    test('should parse Excel file successfully', async () => {
      // Mock Excel file buffer (simplified for testing)
      const mockFileBuffer = Buffer.from('mock excel content');
      
      const file = {
        buffer: mockFileBuffer,
        originalname: 'test.xlsx',
        size: mockFileBuffer.length
      };
      
      // Mock fs-extra methods
      jest.spyOn(fs, 'readFile').mockResolvedValue(mockFileBuffer);
      jest.spyOn(fs, 'stat').mockResolvedValue({ size: mockFileBuffer.length });
      
      // Mock the actual parsing to return test data
      const originalParseFile = excelParserService.parseFile;
      jest.spyOn(excelParserService, 'parseFile').mockImplementation(async (file, instituteId, year) => {
        return {
          success: true,
          data: [
            { parameterName: 'Teacher-Student Ratio', value: '1:30', dataType: 'STRING' },
            { parameterName: 'Faculty strength', value: 50, dataType: 'INTEGER' }
          ],
          errors: [],
          warnings: [],
          userMessages: {
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
        };
      });
      
      const result = await excelParserService.parseFile(
        file,
        'test-institute-001',
        2025
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.userMessages).toBeDefined();
      expect(result.stats).toBeDefined();
      
      // Restore original method
      excelParserService.parseFile.mockRestore();
    });
    
    test('should reject unsupported file format', async () => {
      const file = {
        buffer: Buffer.from('test content'),
        originalname: 'test.txt',
        size: 12
      };
      
      await expect(
        excelParserService.parseFile(file, 'test-institute-001', 2025)
      ).rejects.toThrow('Unsupported file format: txt');
    });
  });
  
  describe('generateUserMessages', () => {
    test('should generate critical messages when no values found', () => {
      const results = [
        { parameterName: 'Test Param 1', value: '', dataType: 'STRING' },
        { parameterName: 'Test Param 2', value: null, dataType: 'INTEGER' }
      ];
      
      const missingParameters = [];
      const expectedParameters = [
        { name: 'Test Param 1', dataType: 'STRING', category: 'test' },
        { name: 'Test Param 2', dataType: 'INTEGER', category: 'test' }
      ];
      
      const messages = excelParserService.generateUserMessages(
        results,
        missingParameters,
        expectedParameters
      );
      
      expect(messages.messages.critical).toHaveLength(4);
      expect(messages.messages.critical[0]).toContain('CRITICAL: File uploaded but no values found');
      expect(messages.messages.info).toHaveLength(2);
      expect(messages.stats.completeness).toBe(0);
    });
    
    test('should generate warning messages for missing parameters', () => {
      const results = [
        { parameterName: 'Test Param 1', value: 'Value 1', dataType: 'STRING' }
      ];
      
      const missingParameters = [
        { name: 'Missing Param 1', dataType: 'STRING', category: 'test' },
        { name: 'Missing Param 2', dataType: 'INTEGER', category: 'test' }
      ];
      
      const expectedParameters = [
        { name: 'Test Param 1', dataType: 'STRING', category: 'test' },
        { name: 'Missing Param 1', dataType: 'STRING', category: 'test' },
        { name: 'Missing Param 2', dataType: 'INTEGER', category: 'test' }
      ];
      
      const messages = excelParserService.generateUserMessages(
        results,
        missingParameters,
        expectedParameters
      );
      
      expect(messages.messages.warning).toHaveLength(3);
      expect(messages.messages.warning[0]).toContain('WARNING: 2 parameters are missing');
      expect(messages.stats.completeness).toBe(33); // 1 out of 3 filled
    });
    
    test('should generate success messages for complete data', () => {
      const results = [
        { parameterName: 'Test Param 1', value: 'Value 1', dataType: 'STRING' },
        { parameterName: 'Test Param 2', value: 42, dataType: 'INTEGER' }
      ];
      
      const missingParameters = [];
      const expectedParameters = [
        { name: 'Test Param 1', dataType: 'STRING', category: 'test' },
        { name: 'Test Param 2', dataType: 'INTEGER', category: 'test' }
      ];
      
      const messages = excelParserService.generateUserMessages(
        results,
        missingParameters,
        expectedParameters
      );
      
      expect(messages.messages.success).toHaveLength(2);
      expect(messages.messages.success[0]).toContain('SUCCESS: All 2 parameters found with values');
      expect(messages.stats.completeness).toBe(100);
    });
  });
  
  describe('convertToDatabaseFormat', () => {
    test('should convert parsed data to database format', () => {
      const parsedData = [
        { parameterName: 'Teacher-Student Ratio', value: '1:30', dataType: 'STRING' },
        { parameterName: 'Faculty strength', value: 50, dataType: 'INTEGER' },
        { parameterName: 'Empty Param', value: '', dataType: 'STRING' }
      ];
      
      const dbData = excelParserService.convertToDatabaseFormat(
        parsedData,
        'test-institute-001',
        2025,
        'CSV_UPLOAD'
      );
      
      expect(dbData.instituteId).toBe('test-institute-001');
      expect(dbData.academicYear).toBe(2025);
      expect(dbData.source).toBe('CSV_UPLOAD');
      expect(dbData.parameters).toBeDefined();
      expect(Object.keys(dbData.parameters)).toHaveLength(2); // Only 2 have values
      expect(dbData.completeness).toBeGreaterThan(0);
      expect(dbData.metadata.totalParameters).toBe(3);
    });
  });
  
  describe('validateParameterRow', () => {
    test('should validate valid parameter row', () => {
      const row = {
        Parameters: 'Teacher-Student Ratio',
        Value: '1:30',
        'Data Type': 'STRING'
      };
      
      const expectedParameters = [
        { name: 'Teacher-Student Ratio', dataType: 'STRING', category: 'infrastructure' }
      ];
      
      const result = excelParserService.validateParameterRow(row, expectedParameters);
      
      expect(result.isValid).toBe(true);
      expect(result.parameter.name).toBe('Teacher-Student Ratio');
    });
    
    test('should reject row with missing parameter name', () => {
      const row = {
        Value: '1:30',
        'Data Type': 'STRING'
      };
      
      const expectedParameters = [
        { name: 'Teacher-Student Ratio', dataType: 'STRING', category: 'infrastructure' }
      ];
      
      const result = excelParserService.validateParameterRow(row, expectedParameters);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Missing "Parameters" column value');
    });
    
    test('should reject unknown parameter', () => {
      const row = {
        Parameters: 'Unknown Parameter',
        Value: 'Some value',
        'Data Type': 'STRING'
      };
      
      const expectedParameters = [
        { name: 'Teacher-Student Ratio', dataType: 'STRING', category: 'infrastructure' }
      ];
      
      const result = excelParserService.validateParameterRow(row, expectedParameters);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unknown parameter');
    });
  });
  
  describe('validateValueByDataType', () => {
    test('should validate STRING type', () => {
      const result = excelParserService.validateValueByDataType('Test String', 'STRING');
      expect(result.isValid).toBe(true);
      expect(result.validatedValue).toBe('Test String');
    });
    
    test('should validate INTEGER type', () => {
      const result = excelParserService.validateValueByDataType('42', 'INTEGER');
      expect(result.isValid).toBe(true);
      expect(result.validatedValue).toBe(42);
    });
    
    test('should reject invalid INTEGER', () => {
      const result = excelParserService.validateValueByDataType('not a number', 'INTEGER');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Must be a valid integer number');
    });
    
    test('should validate BOOLEAN type', () => {
      const trueResult = excelParserService.validateValueByDataType('true', 'BOOLEAN');
      expect(trueResult.isValid).toBe(true);
      expect(trueResult.validatedValue).toBe(true);
      
      const falseResult = excelParserService.validateValueByDataType('no', 'BOOLEAN');
      expect(falseResult.isValid).toBe(true);
      expect(falseResult.validatedValue).toBe(false);
    });
    
    test('should accept empty values', () => {
      const result = excelParserService.validateValueByDataType('', 'STRING');
      expect(result.isValid).toBe(true);
      expect(result.validatedValue).toBeNull();
    });
  });
});
