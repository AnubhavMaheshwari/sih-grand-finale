/**
 * CSV/Excel Debugger Utility
 * Provides step-by-step debugging for CSV/XLSX parsing operations
 */

import excelParserService from '../services/excelParser.service.js';
import fs from 'fs-extra';

/**
 * Debug logger for CSV/Excel operations
 */
class CsvExcelDebugger {
  
  /**
   * Log helper for consistent debugging format
   * @param {string} step - Step description
   * @param {any} data - Data to log
   * @param {string} type - Log type (info, success, warning, error)
   */
  static logDebug(step, data = null, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[CSV/Excel Debugger] [${timestamp}]`;
    
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
        console.log(`🔍 ${prefix} ${step}`);
    }
    
    if (data !== null) {
      console.log(`${prefix} Data:`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    }
  }
  
  /**
   * Test parsing a CSV/Excel file with detailed step-by-step logging
   * @param {string} filePath - Path to the CSV/Excel file
   * @param {string} instituteId - Institute ID for testing
   * @param {number} academicYear - Academic year for testing
   * @returns {Promise<Object>} Parsing results with debug information
   */
  static async debugParseFile(filePath, instituteId = 'test-institute-001', academicYear = 2025) {
    try {
      this.logDebug(`Step 1: Starting debug parsing session`);
      this.logDebug(`Step 2: File path: ${filePath}`);
      this.logDebug(`Step 3: Institute ID: ${instituteId}`);
      this.logDebug(`Step 4: Academic year: ${academicYear}`);
      
      // Check if file exists
      if (!await fs.pathExists(filePath)) {
        this.logDebug(`Step 5: File not found`, null, 'error');
        throw new Error(`File not found: ${filePath}`);
      }
      
      this.logDebug(`Step 5: File exists, reading file stats`);
      const stats = await fs.stat(filePath);
      this.logDebug(`Step 6: File stats`, {
        size: stats.size,
        modified: stats.mtime,
        isFile: stats.isFile()
      });
      
      // Read file buffer
      this.logDebug(`Step 7: Reading file buffer`);
      const fileBuffer = await fs.readFile(filePath);
      this.logDebug(`Step 8: File buffer read`, {
        bufferSize: fileBuffer.length,
        bufferType: typeof fileBuffer
      });
      
      // Get file name from path
      const fileName = filePath.split('/').pop();
      this.logDebug(`Step 9: File name extracted`, fileName);
      
      // Create file object for parser
      const fileObject = {
        buffer: fileBuffer,
        originalname: fileName,
        size: stats.size
      };
      
      this.logDebug(`Step 10: Calling Excel parser service`);
      
      // Parse the file
      const parseResult = await excelParserService.parseFile(
        fileObject,
        instituteId,
        academicYear
      );
      
      this.logDebug(`Step 11: Parsing completed`, {
        success: parseResult.success,
        parametersFound: parseResult.data?.length || 0,
        errors: parseResult.errors?.length || 0,
        warnings: parseResult.warnings?.length || 0
      });
      
      if (parseResult.success) {
        this.logDebug(`Step 12: Parsing successful!`, null, 'success');
        
        // Show sample data
        if (parseResult.data && parseResult.data.length > 0) {
          this.logDebug(`Step 13: Sample parsed data (first 5 items)`);
          parseResult.data.slice(0, 5).forEach((item, index) => {
            this.logDebug(`  ${index + 1}. ${item.parameterName}: ${item.value} (${item.dataType})`);
          });
        }
        
        // Show summary
        if (parseResult.summary) {
          this.logDebug(`Step 14: Parsing summary`, parseResult.summary);
        }
        
        // Show errors if any
        if (parseResult.errors && parseResult.errors.length > 0) {
          this.logDebug(`Step 15: Errors found (${parseResult.errors.length})`, null, 'warning');
          parseResult.errors.slice(0, 3).forEach((error, index) => {
            this.logDebug(`  Error ${index + 1}: ${error.error}`, error.row);
          });
        }
        
        // Show warnings if any
        if (parseResult.warnings && parseResult.warnings.length > 0) {
          this.logDebug(`Step 16: Warnings found (${parseResult.warnings.length})`, null, 'warning');
          parseResult.warnings.forEach((warning, index) => {
            this.logDebug(`  Warning ${index + 1}: ${warning}`);
          });
        }
        
        // Convert to database format
        this.logDebug(`Step 17: Converting to database format`);
        const dbData = excelParserService.convertToDatabaseFormat(
          parseResult.data,
          instituteId,
          academicYear,
          'DEBUG_UPLOAD'
        );
        
        this.logDebug(`Step 18: Database format conversion complete`, {
          completeness: dbData.completeness,
          parametersCount: Object.keys(dbData.parameters || {}).length
        });
        
        // Show database format sample
        if (dbData.parameters) {
          this.logDebug(`Step 19: Database format sample (first 3 parameters)`);
          const paramKeys = Object.keys(dbData.parameters);
          paramKeys.slice(0, 3).forEach((key, index) => {
            const param = dbData.parameters[key];
            this.logDebug(`  ${index + 1}. ${key}: ${param.value} (${param.dataType})`);
          });
        }
        
        return {
          success: true,
          debugSession: {
            filePath,
            instituteId,
            academicYear,
            timestamp: new Date().toISOString()
          },
          parseResult,
          dbData,
          recommendations: this.generateRecommendations(parseResult)
        };
        
      } else {
        this.logDebug(`Step 12: Parsing failed`, null, 'error');
        return {
          success: false,
          debugSession: {
            filePath,
            instituteId,
            academicYear,
            timestamp: new Date().toISOString()
          },
          parseResult,
          error: 'Parsing failed'
        };
      }
      
    } catch (error) {
      this.logDebug(`Step 99: Debug parsing failed with error`, error.message, 'error');
      return {
        success: false,
        debugSession: {
          filePath,
          instituteId,
          academicYear,
          timestamp: new Date().toISOString()
        },
        error: error.message,
        stack: error.stack
      };
    }
  }
  
  /**
   * Generate recommendations based on parsing results
   * @param {Object} parseResult - Parsing results
   * @returns {Array} List of recommendations
   */
  static generateRecommendations(parseResult) {
    const recommendations = [];
    
    if (!parseResult.success) {
      recommendations.push('Fix parsing errors before proceeding');
      return recommendations;
    }
    
    // Check completeness
    const totalExpected = 27; // Total expected parameters
    const foundCount = parseResult.data?.length || 0;
    const completeness = Math.round((foundCount / totalExpected) * 100);
    
    if (completeness < 100) {
      recommendations.push(`Data completeness is ${completeness}%. Consider adding missing parameters.`);
    }
    
    // Check for errors
    if (parseResult.errors && parseResult.errors.length > 0) {
      recommendations.push(`Fix ${parseResult.errors.length} parsing errors for better data quality.`);
    }
    
    // Check data types
    if (parseResult.data) {
      const typeIssues = parseResult.data.filter(item => 
        item.value === null || item.value === undefined || item.value === ''
      );
      if (typeIssues.length > 0) {
        recommendations.push(`${typeIssues.length} parameters have empty values. Consider providing values.`);
      }
    }
    
    return recommendations;
  }
  
  /**
   * Test with sample files from the project
   * @returns {Promise<Object>} Test results
   */
  static async testWithSampleFiles() {
    this.logDebug(`Starting sample files test`, null, 'info');
    
    const sampleFiles = [
      'frontend/public/sample_data/institute_parameters_template.csv',
      'frontend/public/sample_data/institute_parameters_template.xlsx'
    ];
    
    const results = [];
    
    for (const filePath of sampleFiles) {
      try {
        if (await fs.pathExists(filePath)) {
          this.logDebug(`Testing file: ${filePath}`);
          const result = await this.debugParseFile(filePath);
          results.push({
            file: filePath,
            success: result.success,
            parametersFound: result.parseResult?.data?.length || 0
          });
        } else {
          this.logDebug(`File not found: ${filePath}`, null, 'warning');
          results.push({
            file: filePath,
            success: false,
            error: 'File not found'
          });
        }
      } catch (error) {
        this.logDebug(`Error testing file ${filePath}: ${error.message}`, null, 'error');
        results.push({
          file: filePath,
          success: false,
          error: error.message
        });
      }
    }
    
    this.logDebug(`Sample files test completed`, {
      totalFiles: sampleFiles.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }, 'success');
    
    return results;
  }
  
  /**
   * Create a simple test endpoint for manual testing
   * This can be used in routes for debugging
   */
  static async handleDebugRequest(req, res) {
    try {
      const { filePath, instituteId = 'test-institute-001', academicYear = 2025 } = req.body;
      
      if (!filePath) {
        return res.status(400).json({
          success: false,
          error: 'filePath is required in request body'
        });
      }
      
      const result = await this.debugParseFile(filePath, instituteId, academicYear);
      
      return res.status(200).json({
        success: true,
        debugResult: result
      });
      
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

export default CsvExcelDebugger;
