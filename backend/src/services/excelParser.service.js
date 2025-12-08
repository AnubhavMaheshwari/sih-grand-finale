import csv from 'csv-parser';
import xlsx from 'xlsx';
import { Readable } from 'stream';
import InstituteData from '../models/InstituteData.model.js';
import InstituteParameterHistory from '../models/InstituteParameterHistory.model.js';
import { ApiError } from '../utils/apiResponse.js';

/**
 * Service for parsing Excel/CSV files containing institute parameter data
 */
class ExcelParserService {
  
  /**
   * Log helper for consistent logging format
   * @param {string} step - Step description
   * @param {any} data - Data to log
   * @param {string} type - Log type (info, success, warning, error)
   */
  logStep(step, data = null, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[CSV/XLSX Parser] [${timestamp}]`;
    
    switch(type) {
      case 'success':
        console.log(`✅ ${prefix} ${step}`);
        break;
      case 'warning':
        console.warn(`⚠️ ${prefix} ${step}`);
        break;
      case 'error':
        console.error(`❌ ${prefix} ${step}`);
        break;
      default:
        console.log(`📝 ${prefix} ${step}`);
    }
    
    if (data !== null) {
      console.log(`${prefix} Data:`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    }
  }
  /**
   * Parse CSV or Excel file and extract parameter data
   * @param {Object} file - Uploaded file object
   * @param {string} instituteId - Institute ID
   * @param {number} academicYear - Academic year
   * @returns {Promise<Object>} Parsed data and validation results
   */
  async parseFile(file, instituteId, academicYear) {
    this.logStep(`Step 1: Starting file parsing process`, {
      fileName: file.originalname,
      fileSize: file.size,
      instituteId,
      academicYear
    });
    
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    this.logStep(`Step 2: Detected file extension: ${fileExtension}`);
    
    if (fileExtension === 'csv') {
      this.logStep(`Step 3: Processing as CSV file`);
      return this.parseCsvFile(file, instituteId, academicYear);
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      this.logStep(`Step 3: Processing as Excel file (${fileExtension})`);
      return this.parseExcelFile(file, instituteId, academicYear);
    } else {
      this.logStep(`Step 3: Unsupported file format: ${fileExtension}`, null, 'error');
      throw new ApiError(400, `Unsupported file format: ${fileExtension}. Please upload CSV or Excel files.`);
    }
  }

  /**
   * Parse CSV file and extract parameter data
   * @param {Object} file - Uploaded file object
   * @param {string} instituteId - Institute ID
   * @param {number} academicYear - Academic year
   * @returns {Promise<Object>} Parsed data and validation results
   */
  async parseCsvFile(file, instituteId, academicYear) {
    this.logStep(`Step 4: Starting CSV file parsing`);
    
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      const warnings = [];
      
      // Expected parameter mappings
      const expectedParameters = this.getExpectedParameters();
      this.logStep(`Step 5: Loaded ${expectedParameters.length} expected parameters`);
      
      // Create readable stream from buffer
      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      
      let rowCount = 0;
      
      this.logStep(`Step 6: Starting CSV stream parsing`);
      
      readableStream
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          try {
            const validationResult = this.validateParameterRow(row, expectedParameters);
            
            if (validationResult.isValid) {
              results.push({
                parameterName: row.Parameters,
                value: row.Value,
                dataType: row['Data Type'] || 'STRING',
                notes: row.Notes || ''
              });
              
              if (rowCount % 5 === 0) {
                this.logStep(`Step 6.${rowCount}: Processed row ${rowCount} - "${row.Parameters}": ${row.Value}`);
              }
            } else {
              errors.push({
                row: row,
                error: validationResult.error
              });
              this.logStep(`Step 6.${rowCount}: Validation error in row ${rowCount}`, validationResult.error, 'warning');
            }
          } catch (error) {
            errors.push({
              row: row,
              error: `Error parsing row: ${error.message}`
            });
            this.logStep(`Step 6.${rowCount}: Parsing error in row ${rowCount}`, error.message, 'error');
          }
        })
        .on('end', () => {
          this.logStep(`Step 7: CSV parsing completed`, {
            totalRows: rowCount,
            validRows: results.length,
            errorRows: errors.length
          });
          
          if (results.length === 0 && errors.length > 0) {
            this.logStep(`Step 8: No valid data found in CSV file`, null, 'error');
            reject(new ApiError(400, 'No valid parameter data found in CSV file'));
            return;
          }
          
          // Check for missing required parameters
          const foundParameters = results.map(r => r.parameterName);
          const missingParameters = expectedParameters.filter(
            param => !foundParameters.includes(param.name)
          );
          
          if (missingParameters.length > 0) {
            warnings.push(`Missing ${missingParameters.length} parameters: ${missingParameters.map(p => p.name).join(', ')}`);
            this.logStep(`Step 8: Missing ${missingParameters.length} parameters`, missingParameters, 'warning');
          }
          
          // Generate user-friendly messages
          const userMessages = this.generateUserMessages(results, missingParameters, expectedParameters);
          
          // Log final JSON output
          this.logStep(`Step 9: Generated JSON output`, {
            totalParameters: results.length,
            sampleData: results.slice(0, 3) // Show first 3 parameters as sample
          });
          
          this.logStep(`Step 10: CSV parsing successful!`, {
            summary: {
              totalRows: results.length + errors.length,
              validRows: results.length,
              errorRows: errors.length,
              missingParameters: missingParameters.length,
              completeness: userMessages.stats.completeness
            }
          }, 'success');
          
          // Log user messages
          if (userMessages.messages.critical.length > 0) {
            userMessages.messages.critical.forEach(msg => this.logStep(msg, null, 'error'));
          }
          if (userMessages.messages.warning.length > 0) {
            userMessages.messages.warning.forEach(msg => this.logStep(msg, null, 'warning'));
          }
          if (userMessages.messages.info.length > 0) {
            userMessages.messages.info.forEach(msg => this.logStep(msg, null, 'info'));
          }
          if (userMessages.messages.success.length > 0) {
            userMessages.messages.success.forEach(msg => this.logStep(msg, null, 'success'));
          }
          
          resolve({
            success: true,
            data: results,
            errors: errors,
            warnings: warnings,
            userMessages: userMessages.messages,
            stats: userMessages.stats,
            summary: {
              totalRows: results.length + errors.length,
              validRows: results.length,
              errorRows: errors.length,
              missingParameters: missingParameters.length,
              completeness: userMessages.stats.completeness
            }
          });
        })
        .on('error', (error) => {
          this.logStep(`Step 7: CSV stream error`, error.message, 'error');
          reject(new ApiError(500, `CSV parsing error: ${error.message}`));
        });
    });
  }

  /**
   * Parse Excel file and extract parameter data
   * @param {Object} file - Uploaded file object
   * @param {string} instituteId - Institute ID
   * @param {number} academicYear - Academic year
   * @returns {Promise<Object>} Parsed data and validation results
   */
  async parseExcelFile(file, instituteId, academicYear) {
    this.logStep(`Step 4: Starting Excel file parsing`);
    
    try {
      const results = [];
      const errors = [];
      const warnings = [];
      
      // Expected parameter mappings
      const expectedParameters = this.getExpectedParameters();
      this.logStep(`Step 5: Loaded ${expectedParameters.length} expected parameters`);
      
      // Read Excel file
      this.logStep(`Step 6: Reading Excel workbook from buffer`);
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      this.logStep(`Step 7: Using sheet "${sheetName}"`);
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      this.logStep(`Step 8: Converting sheet to JSON`);
      const data = xlsx.utils.sheet_to_json(worksheet);
      this.logStep(`Step 9: Found ${data.length} rows in Excel file`);
      
      if (data.length === 0) {
        this.logStep(`Step 10: Excel file is empty`, null, 'error');
        throw new ApiError(400, 'Excel file is empty or has no data');
      }
      
      // Validate required columns
      const firstRow = data[0];
      if (!firstRow.Parameters && !firstRow.PARAMETERS) {
        this.logStep(`Step 10: Missing "Parameters" column`, firstRow, 'error');
        throw new ApiError(400, 'Excel file must have "Parameters" column');
      }
      
      this.logStep(`Step 10: Valid columns found, starting row processing`);
      
      // Process each row
      data.forEach((row, index) => {
        try {
          // Normalize column names (case-insensitive)
          const normalizedRow = {};
          Object.keys(row).forEach(key => {
            normalizedRow[key.toLowerCase()] = row[key];
          });
          
          const validationResult = this.validateParameterRow(normalizedRow, expectedParameters);
          
          if (validationResult.isValid) {
            results.push({
              parameterName: normalizedRow.parameters || normalizedRow.parameter,
              value: normalizedRow.value,
              dataType: normalizedRow['data type'] || normalizedRow.datatype || 'STRING',
              notes: normalizedRow.notes || ''
            });
            
            if ((index + 1) % 5 === 0) {
              this.logStep(`Step 10.${index + 1}: Processed row ${index + 1} - "${normalizedRow.parameters || normalizedRow.parameter}": ${normalizedRow.value}`);
            }
          } else {
            errors.push({
              row: row,
              rowNumber: index + 2, // +2 because Excel rows start at 1 and header is row 1
              error: validationResult.error
            });
            this.logStep(`Step 10.${index + 1}: Validation error in row ${index + 2}`, validationResult.error, 'warning');
          }
        } catch (error) {
          errors.push({
            row: row,
            rowNumber: index + 2,
            error: `Error parsing row: ${error.message}`
          });
          this.logStep(`Step 10.${index + 1}: Parsing error in row ${index + 2}`, error.message, 'error');
        }
      });
      
      this.logStep(`Step 11: Row processing completed`, {
        validRows: results.length,
        errorRows: errors.length
      });
      
      if (results.length === 0 && errors.length > 0) {
        this.logStep(`Step 12: No valid data found in Excel file`, null, 'error');
        throw new ApiError(400, 'No valid parameter data found in Excel file');
      }
      
      // Check for missing required parameters
      const foundParameters = results.map(r => r.parameterName);
      const missingParameters = expectedParameters.filter(
        param => !foundParameters.includes(param.name)
      );
      
      if (missingParameters.length > 0) {
        warnings.push(`Missing ${missingParameters.length} parameters: ${missingParameters.map(p => p.name).join(', ')}`);
        this.logStep(`Step 12: Missing ${missingParameters.length} parameters`, missingParameters, 'warning');
      }
      
      // Generate user-friendly messages
      const userMessages = this.generateUserMessages(results, missingParameters, expectedParameters);
      
      // Log final JSON output
      this.logStep(`Step 13: Generated JSON output`, {
        totalParameters: results.length,
        sampleData: results.slice(0, 3) // Show first 3 parameters as sample
      });
      
      this.logStep(`Step 14: Excel parsing successful!`, {
        summary: {
          totalRows: results.length + errors.length,
          validRows: results.length,
          errorRows: errors.length,
          missingParameters: missingParameters.length,
          completeness: userMessages.stats.completeness
        }
      }, 'success');
      
      // Log user messages
      if (userMessages.messages.critical.length > 0) {
        userMessages.messages.critical.forEach(msg => this.logStep(msg, null, 'error'));
      }
      if (userMessages.messages.warning.length > 0) {
        userMessages.messages.warning.forEach(msg => this.logStep(msg, null, 'warning'));
      }
      if (userMessages.messages.info.length > 0) {
        userMessages.messages.info.forEach(msg => this.logStep(msg, null, 'info'));
      }
      if (userMessages.messages.success.length > 0) {
        userMessages.messages.success.forEach(msg => this.logStep(msg, null, 'success'));
      }
      
      return {
        success: true,
        data: results,
        errors: errors,
        warnings: warnings,
        userMessages: userMessages.messages,
        stats: userMessages.stats,
        summary: {
          totalRows: results.length + errors.length,
          validRows: results.length,
          errorRows: errors.length,
          missingParameters: missingParameters.length,
          completeness: userMessages.stats.completeness
        }
      };
    } catch (error) {
      if (error instanceof ApiError) {
        this.logStep(`Step 15: API Error occurred`, error.message, 'error');
        throw error;
      }
      this.logStep(`Step 15: Excel parsing error`, error.message, 'error');
      throw new ApiError(500, `Excel parsing error: ${error.message}`);
    }
  }

  /**
   * Validate a single parameter row
   * @param {Object} row - CSV/Excel row data
   * @param {Array} expectedParameters - Expected parameters
   * @returns {Object} Validation result
   */
  validateParameterRow(row, expectedParameters) {
    // Check required columns (case-insensitive)
    const paramKey = Object.keys(row).find(key => 
      key.toLowerCase() === 'parameters' || key.toLowerCase() === 'parameter'
    );
    
    if (!paramKey || !row[paramKey] || !row[paramKey].toString().trim()) {
      return {
        isValid: false,
        error: 'Missing "Parameters" column value'
      };
    }
    
    const paramName = row[paramKey].toString().trim();
    
    // Find expected parameter
    const expectedParam = expectedParameters.find(p => 
      p.name.toLowerCase() === paramName.toLowerCase()
    );
    
    if (!expectedParam) {
      return {
        isValid: false,
        error: `Unknown parameter: "${paramName}"`
      };
    }
    
    // Validate value based on data type
    const valueKey = Object.keys(row).find(key => key.toLowerCase() === 'value');
    const value = valueKey ? row[valueKey] : null;
    
    const validation = this.validateValueByDataType(value, expectedParam.dataType);
    
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `Invalid value for "${paramName}": ${validation.error}`
      };
    }
    
    return {
      isValid: true,
      parameter: expectedParam,
      validatedValue: validation.validatedValue
    };
  }

  /**
   * Validate value based on data type
   * @param {string} value - Raw value
   * @param {string} dataType - Expected data type
   * @returns {Object} Validation result
   */
  validateValueByDataType(value, dataType) {
    if (value === undefined || value === null || value === '') {
      return {
        isValid: true,
        validatedValue: null
      };
    }
    
    const trimmedValue = value.toString().trim();
    
    switch (dataType.toUpperCase()) {
      case 'STRING':
      case 'TEXT':
        return {
          isValid: true,
          validatedValue: trimmedValue
        };
        
      case 'INTEGER':
        const intValue = parseInt(trimmedValue, 10);
        if (isNaN(intValue)) {
          return {
            isValid: false,
            error: 'Must be a valid integer number'
          };
        }
        return {
          isValid: true,
          validatedValue: intValue
        };
        
      case 'DECIMAL':
      case 'FLOAT':
        const floatValue = parseFloat(trimmedValue);
        if (isNaN(floatValue)) {
          return {
            isValid: false,
            error: 'Must be a valid decimal number'
          };
        }
        return {
          isValid: true,
          validatedValue: floatValue
        };
        
      case 'LONG':
        const longValue = parseInt(trimmedValue, 10);
        if (isNaN(longValue)) {
          return {
            isValid: false,
            error: 'Must be a valid number'
          };
        }
        return {
          isValid: true,
          validatedValue: longValue
        };
        
      case 'BOOLEAN':
        const lowerValue = trimmedValue.toLowerCase();
        if (['true', 'yes', '1', 'y'].includes(lowerValue)) {
          return {
            isValid: true,
            validatedValue: true
          };
        } else if (['false', 'no', '0', 'n'].includes(lowerValue)) {
          return {
            isValid: true,
            validatedValue: false
          };
        } else {
          return {
            isValid: false,
            error: 'Must be true/false, yes/no, or 1/0'
          };
        }
        
      default:
        return {
          isValid: true,
          validatedValue: trimmedValue
        };
    }
  }

  /**
   * Generate user-friendly messages for missing or empty data
   * @param {Array} results - Parsed results
   * @param {Array} missingParameters - Missing parameters
   * @param {Array} expectedParameters - All expected parameters
   * @returns {Object} User-friendly messages
   */
  generateUserMessages(results, missingParameters, expectedParameters) {
    const messages = {
      critical: [],
      warning: [],
      info: [],
      success: []
    };
    
    const totalExpected = expectedParameters.length;
    const foundCount = results.length;
    const missingCount = missingParameters.length;
    
    // Count parameters with empty values
    const emptyValueCount = results.filter(item => 
      item.value === null || item.value === undefined || item.value === ''
    ).length;
    
    const filledCount = foundCount - emptyValueCount;
    const completeness = Math.round((filledCount / totalExpected) * 100);
    
    // Critical messages
    if (foundCount === 0) {
      messages.critical.push(
        '❌ CRITICAL: No parameter data found in the uploaded file.',
        '   Please check if the file contains the required columns.',
        '   Refer to sample template: /sample_data/institute_parameters_template.csv'
      );
    } else if (filledCount === 0) {
      messages.critical.push(
        '❌ CRITICAL: File uploaded but no values found for any parameters.',
        '   All parameter rows have empty values.',
        '   Please fill in the values in your CSV/Excel file.',
        '   Sample template: /sample_data/institute_parameters_template.xlsx'
      );
    }
    
    // Warning messages
    if (missingCount > 0) {
      if (missingCount === totalExpected) {
        messages.warning.push(
          `⚠️ WARNING: All ${totalExpected} expected parameters are missing from your file.`,
          '   Please ensure your file includes all required parameters.',
          '   Download sample template: /sample_data/institute_parameters_template.csv'
        );
      } else if (missingCount <= 5) {
        const paramNames = missingParameters.map(p => `"${p.name}"`).join(', ');
        messages.warning.push(
          `⚠️ WARNING: ${missingCount} parameter${missingCount > 1 ? 's are' : ' is'} missing: ${paramNames}`,
          '   Please add these parameters to your file.',
          '   Refer to sample template for correct format.'
        );
      } else {
        const sampleMissing = missingParameters.slice(0, 5).map(p => `- ${p.name}`).join('\n   ');
        messages.warning.push(
          `⚠️ WARNING: ${missingCount} parameters are missing from your upload.`,
          '   First 5 missing parameters:',
          `   ${sampleMissing}`,
          `   ... and ${missingCount - 5} more`,
          '   Please ensure all parameters are included.',
          '   Sample template: /sample_data/institute_parameters_template.xlsx'
        );
      }
    }
    
    // Info messages
    if (emptyValueCount > 0) {
      if (emptyValueCount === foundCount) {
        messages.info.push(
          `ℹ️ INFO: All ${foundCount} parameters in the file have empty values.`,
          '   You can fill these values later in the parameter submission form.'
        );
      } else if (emptyValueCount <= 3) {
        const emptyParams = results
          .filter(item => item.value === null || item.value === undefined || item.value === '')
          .slice(0, 3)
          .map(item => `"${item.parameterName}"`)
          .join(', ');
        messages.info.push(
          `ℹ️ INFO: ${emptyValueCount} parameter${emptyValueCount > 1 ? 's have' : ' has'} empty values: ${emptyParams}`,
          '   Consider providing values for better data completeness.'
        );
      } else {
        messages.info.push(
          `ℹ️ INFO: ${emptyValueCount} out of ${foundCount} parameters have empty values.`,
          `   Data completeness is currently ${completeness}%.`,
          '   Fill missing values to improve completeness.'
        );
      }
    }
    
    // Success messages
    if (missingCount === 0 && emptyValueCount === 0) {
      messages.success.push(
        `✅ SUCCESS: All ${totalExpected} parameters found with values!`,
        `   Data completeness: 100%`
      );
    } else if (completeness >= 80) {
      messages.success.push(
        `✅ SUCCESS: File uploaded successfully!`,
        `   Data completeness: ${completeness}%`,
        `   ${filledCount} out of ${totalExpected} parameters filled.`
      );
    } else if (completeness > 0) {
      messages.success.push(
        `✅ File uploaded successfully.`,
        `   Data completeness: ${completeness}%`,
        `   ${filledCount} out of ${totalExpected} parameters filled.`
      );
    }
    
    return {
      messages,
      stats: {
        totalExpected,
        foundCount,
        missingCount,
        emptyValueCount,
        filledCount,
        completeness
      }
    };
  }

  /**
   * Get expected parameters with their data types
   * @returns {Array} Expected parameters
   */
  getExpectedParameters() {
    return [
      // Infrastructure Parameters
      { name: 'Teacher-Student Ratio', dataType: 'STRING', category: 'infrastructure' },
      { name: 'Vacancy in BOYS hostel (UG)', dataType: 'INTEGER', category: 'infrastructure' },
      { name: 'Vacancy in GIRLS hostel (UG)', dataType: 'INTEGER', category: 'infrastructure' },
      { name: 'Classroom capacity', dataType: 'INTEGER', category: 'infrastructure' },
      { name: 'Lift available', dataType: 'BOOLEAN', category: 'infrastructure' },
      { name: 'Placement percentage', dataType: 'INTEGER', category: 'academic' },
      { name: 'Labs facilities', dataType: 'TEXT', category: 'infrastructure' },
      { name: 'Students going for higher studies', dataType: 'INTEGER', category: 'academic' },
      { name: 'Lab equipments', dataType: 'INTEGER', category: 'infrastructure' },
      { name: 'Faculty strength', dataType: 'INTEGER', category: 'faculty' },
      { name: 'Library resources', dataType: 'TEXT', category: 'infrastructure' },
      { name: 'Financial capacity', dataType: 'LONG', category: 'financial' },
      { name: 'Land area (sqkm)', dataType: 'DECIMAL', category: 'infrastructure' },
      { name: 'Academic plan', dataType: 'TEXT', category: 'academic' },
      { name: 'Compliance certificate', dataType: 'TEXT', category: 'compliance' },
      { name: 'ICT facilities', dataType: 'TEXT', category: 'infrastructure' },
      { name: 'Research environment', dataType: 'TEXT', category: 'academic' },
      { name: 'Program justification', dataType: 'TEXT', category: 'academic' },
      { name: 'Qualification of faculties', dataType: 'TEXT', category: 'faculty' },
      { name: 'Land ownership and possession', dataType: 'TEXT', category: 'compliance' },
      { name: 'Building plan requirement', dataType: 'TEXT', category: 'compliance' },
      { name: 'Leadership qualifications', dataType: 'TEXT', category: 'faculty' },
      { name: 'Budget allocation', dataType: 'LONG', category: 'financial' },
      { name: 'Institutional name norms', dataType: 'TEXT', category: 'compliance' },
      { name: 'Available workshops', dataType: 'INTEGER', category: 'infrastructure' },
      { name: 'Safety certificates', dataType: 'TEXT', category: 'compliance' },
    ];
  }

  /**
   * Convert parsed CSV data to database format
   * @param {Array} parsedData - Parsed CSV data
   * @param {string} instituteId - Institute ID
   * @param {number} academicYear - Academic year
   * @param {string} source - Data source (CSV_UPLOAD, WEB_FORM, PDF_PARSER)
   * @returns {Object} Data in database format
   */
  convertToDatabaseFormat(parsedData, instituteId, academicYear, source = 'CSV_UPLOAD') {
    const dbData = {
      instituteId,
      academicYear,
      source,
      parameters: {},
      completeness: 0,
      isVerified: false,
      verifiedBy: null,
      verifiedAt: null,
      metadata: {
        totalParameters: parsedData.length,
        parsedAt: new Date(),
        sourceType: 'CSV'
      }
    };
    
    let filledCount = 0;
    
    parsedData.forEach(item => {
      if (item.value !== null && item.value !== undefined && item.value !== '') {
        filledCount++;
        
        // Convert parameter name to field name (camelCase)
        const fieldName = this.convertToFieldName(item.parameterName);
        
        dbData.parameters[fieldName] = {
          value: item.value,
          dataType: item.dataType,
          originalName: item.parameterName,
          lastUpdated: new Date()
        };
      }
    });
    
    // Calculate completeness percentage
    const totalExpected = this.getExpectedParameters().length;
    dbData.completeness = Math.round((filledCount / totalExpected) * 100);
    
    return dbData;
  }

  /**
   * Convert parameter name to field name (camelCase)
   * @param {string} parameterName - Original parameter name
   * @returns {string} Field name in camelCase
   */
  convertToFieldName(parameterName) {
    return parameterName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .split(' ')
      .map((word, index) => 
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');
  }

  /**
   * Save parsed data to database
   * @param {Object} dbData - Data in database format
   * @returns {Promise<Object>} Saved data
   */
  async saveToDatabase(dbData) {
    const { instituteId, academicYear } = dbData;
    
    // Check if data already exists for this institute and year
    const existingData = await InstituteData.findOne({
      instituteId,
      academicYear
    });
    
    if (existingData) {
      // Update existing data
      const previousData = { ...existingData.parameters };
      
      // Update parameters
      existingData.parameters = {
        ...existingData.parameters,
        ...dbData.parameters
      };
      
      // Update completeness
      existingData.completeness = dbData.completeness;
      existingData.source = dbData.source;
      existingData.metadata = dbData.metadata;
      existingData.updatedAt = new Date();
      
      await existingData.save();
      
      // Create history record for changes
      await this.createHistoryRecord(existingData, previousData, 'UPDATE');
      
      return existingData;
    } else {
      // Create new data
      const newData = new InstituteData(dbData);
      await newData.save();
      
      // Create history record for creation
      await this.createHistoryRecord(newData, {}, 'CREATE');
      
      return newData;
    }
  }

  /**
   * Create history record for data changes
   * @param {Object} currentData - Current data
   * @param {Object} previousData - Previous data (before changes)
   * @param {string} action - Action type (CREATE, UPDATE, VERIFY)
   */
  async createHistoryRecord(currentData, previousData, action) {
    const historyRecord = new InstituteParameterHistory({
      instituteDataId: currentData._id,
      instituteId: currentData.instituteId,
      academicYear: currentData.academicYear,
      action,
      changes: this.extractChanges(previousData, currentData.parameters),
      performedBy: currentData.source === 'ADMIN_VERIFICATION' ? 'admin' : 'institute',
      metadata: {
        source: currentData.source,
        completeness: currentData.completeness,
        timestamp: new Date()
      }
    });
    
    await historyRecord.save();
  }

  /**
   * Extract changes between previous and current data
   * @param {Object} previousData - Previous data
   * @param {Object} currentData - Current data
   * @returns {Array} Array of changes
   */
  extractChanges(previousData, currentData) {
    const changes = [];
    
    // Check for new or updated parameters
    Object.keys(currentData).forEach(key => {
      const currentValue = currentData[key]?.value;
      const previousValue = previousData[key]?.value;
      
      if (previousValue === undefined) {
        // New parameter
        changes.push({
          parameter: key,
          action: 'ADDED',
          previousValue: null,
          newValue: currentValue,
          dataType: currentData[key]?.dataType
        });
      } else if (JSON.stringify(previousValue) !== JSON.stringify(currentValue)) {
        // Updated parameter
        changes.push({
          parameter: key,
          action: 'UPDATED',
          previousValue: previousValue,
          newValue: currentValue,
          dataType: currentData[key]?.dataType
        });
      }
    });
    
    // Check for removed parameters
    Object.keys(previousData).forEach(key => {
      if (currentData[key] === undefined) {
        changes.push({
          parameter: key,
          action: 'REMOVED',
          previousValue: previousData[key]?.value,
          newValue: null,
          dataType: previousData[key]?.dataType
        });
      }
    });
    
    return changes;
  }
}

export default new ExcelParserService();
