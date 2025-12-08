import { PDFParse } from "pdf-parse";
import fs from "fs-extra";
import ParsedDocumentData from "../models/ParsedDocumentData.model.js";
import InstituteData from "../models/InstituteData.model.js";
import FacultyDetails from "../models/facultydetails.model.js";
import StudentStrength from "../models/studentstrength.model.js";
import FinancialResources from "../models/financialresources.model.js";
import PhdStudents from "../models/phdstudents.model.js";
import PlacementHigherStudy from "../models/placement&higherstudy.model.js";
import SanctionedIntake from "../models/sanctionedIntake.model.js";
import SponseredResearch from "../models/sponseredresearch.model.js";

class PDFParserService {
  constructor() {
    this.sectionPatterns = {
      sanctionedIntake: /Sanctioned.*Intake/i,
      studentStrength: /Total Actual Student Strength/i,
      placementHigherStudy: /Placement.*Higher Studies/i,
      phdStudents: /Ph\.?D.*Student/i,
      financialResources: /Financial Resources/i,
      sponsoredResearch: /Sponsored Research/i,
      facultyDetails: /Faculty Details/i,
    };
    
    // Parameter mapping patterns for InstituteData model
    this.parameterPatterns = {
      // Academic parameters
      teacherStudentRatio: /teacher.*student.*ratio.*?(\d+:\d+)/i,
      placementPercentage: /placement.*percentage.*?(\d+)/i,
      studentsGoingForHigherStudies: /higher.*studies.*?(\d+)/i,
      
      // Infrastructure parameters
      vacancyBoysHostelUG: /boys.*hostel.*vacancy.*?(\d+)/i,
      vacancyGirlsHostelUG: /girls.*hostel.*vacancy.*?(\d+)/i,
      classroomCapacity: /classroom.*capacity.*?(\d+)/i,
      liftAvailable: /lift.*available.*?(yes|no|true|false)/i,
      landAreaSqKm: /land.*area.*?(\d+(?:\.\d+)?)\s*(?:sq|square).*km/i,
      
      // Facilities parameters
      labsFacilities: /labs.*facilities.*?\n(.*?)(?=\n\w)/is,
      labEquipments: /lab.*equipments.*?(\d+)/i,
      facultyStrength: /faculty.*strength.*?(\d+)/i,
      libraryResources: /library.*resources.*?\n(.*?)(?=\n\w)/is,
      ictFacilities: /ict.*facilities.*?\n(.*?)(?=\n\w)/is,
      availableWorkshops: /workshops.*available.*?(\d+)/i,
      
      // Administrative parameters
      academicPlan: /academic.*plan.*?\n(.*?)(?=\n\w)/is,
      complianceCertificate: /compliance.*certificate.*?\n(.*?)(?=\n\w)/is,
      researchEnvironment: /research.*environment.*?\n(.*?)(?=\n\w)/is,
      programJustification: /program.*justification.*?\n(.*?)(?=\n\w)/is,
      qualificationOfFaculties: /qualification.*faculties.*?\n(.*?)(?=\n\w)/is,
      landOwnershipAndPossession: /land.*ownership.*?\n(.*?)(?=\n\w)/is,
      buildingPlanRequirement: /building.*plan.*?\n(.*?)(?=\n\w)/is,
      leadershipQualifications: /leadership.*qualifications.*?\n(.*?)(?=\n\w)/is,
      institutionalNameNorms: /institutional.*name.*?\n(.*?)(?=\n\w)/is,
      safetyCertificates: /safety.*certificates.*?\n(.*?)(?=\n\w)/is,
      
      // Financial parameters
      financialCapacity: /financial.*capacity.*?(\d+(?:,\d+)*)/i,
      budgetAllocation: /budget.*allocation.*?(\d+(?:,\d+)*)/i,
    };
  }

  async parseDocument(documentId, filePath) {
    try {
      console.log(`Starting PDF parsing for document: ${documentId}`);
      
      // Read PDF file and convert Buffer to Uint8Array
      const dataBuffer = await fs.readFile(filePath);
      const uint8Array = new Uint8Array(dataBuffer);
      const pdfParser = new PDFParse(uint8Array);
      const pdfData = await pdfParser.getText();
      const text = pdfData.text || pdfData;
      
      console.log(`PDF text extracted (${text.length} characters)`);
      
      // Extract sections
      const sections = this.extractSections(text);
      console.log(`Found ${Object.keys(sections).length} sections`);
      
      // Parse each section
      const parsedData = {};
      const stats = {
        sectionsFound: Object.keys(sections).length,
        sectionsParsed: 0,
        dataPointsExtracted: 0,
        confidenceScore: 0,
      };
      
      for (const [sectionName, sectionText] of Object.entries(sections)) {
        try {
          const sectionData = await this.parseSection(sectionName, sectionText);
          if (sectionData) {
            parsedData[sectionName] = sectionData;
            stats.sectionsParsed++;
            stats.dataPointsExtracted += Object.keys(sectionData).length;
          }
        } catch (error) {
          console.error(`Error parsing section ${sectionName}:`, error);
        }
      }
      
      // Calculate confidence score
      stats.confidenceScore = this.calculateConfidenceScore(stats);
      
      // Extract parameter values for InstituteData
      const extractedParameters = this.extractParameters(text);
      stats.parametersExtracted = Object.keys(extractedParameters).length;
      
      // Save parsed data to database
      const savedData = await this.saveParsedData(documentId, parsedData, stats);
      
      // Save extracted parameters to InstituteData for verification
      if (stats.parametersExtracted > 0) {
        await this.saveExtractedParameters(documentId, extractedParameters, stats.confidenceScore);
      }
      
      console.log(`PDF parsing completed for document: ${documentId}`);
      return {
        success: true,
        parsedData: savedData,
        extractedParameters,
        stats,
      };
    } catch (error) {
      console.error(`PDF parsing error for document ${documentId}:`, error);
      throw error;
    }
  }

  extractSections(text) {
    const sections = {};
    const lines = text.split('\n');
    let currentSection = null;
    let sectionContent = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if line matches any section pattern
      for (const [sectionName, pattern] of Object.entries(this.sectionPatterns)) {
        if (pattern.test(line)) {
          // Save previous section if exists
          if (currentSection && sectionContent.length > 0) {
            sections[currentSection] = sectionContent.join('\n');
          }
          
          // Start new section
          currentSection = sectionName;
          sectionContent = [line];
          break;
        }
      }
      
      // If we're in a section, add line to content
      if (currentSection && !this.isSectionHeader(line)) {
        sectionContent.push(line);
      }
    }
    
    // Save the last section
    if (currentSection && sectionContent.length > 0) {
      sections[currentSection] = sectionContent.join('\n');
    }
    
    return sections;
  }

  isSectionHeader(line) {
    for (const pattern of Object.values(this.sectionPatterns)) {
      if (pattern.test(line)) {
        return true;
      }
    }
    return false;
  }

  async parseSection(sectionName, sectionText) {
    switch (sectionName) {
      case 'studentStrength':
        return this.parseStudentStrength(sectionText);
      case 'facultyDetails':
        return this.parseFacultyDetails(sectionText);
      case 'financialResources':
        return this.parseFinancialResources(sectionText);
      case 'phdStudents':
        return this.parsePhdStudents(sectionText);
      case 'placementHigherStudy':
        return this.parsePlacementHigherStudy(sectionText);
      case 'sanctionedIntake':
        return this.parseSanctionedIntake(sectionText);
      case 'sponsoredResearch':
        return this.parseSponsoredResearch(sectionText);
      default:
        return null;
    }
  }

  parseStudentStrength(text) {
    // Basic parsing - extract numbers
    const numbers = text.match(/\d+/g) || [];
    return {
      totalStudents: numbers[0] ? parseInt(numbers[0]) : null,
      maleStudents: numbers[1] ? parseInt(numbers[1]) : null,
      femaleStudents: numbers[2] ? parseInt(numbers[2]) : null,
      rawText: text.substring(0, 500), // Store first 500 chars for reference
    };
  }

  parseFacultyDetails(text) {
    const numbers = text.match(/\d+/g) || [];
    return {
      totalFaculty: numbers[0] ? parseInt(numbers[0]) : null,
      rawText: text.substring(0, 500),
    };
  }

  parseFinancialResources(text) {
    // Extract amounts (numbers with commas)
    const amountMatches = text.match(/[\d,]+(?:\s*[Ll]akh|\s*[Cc]rore)?/g) || [];
    const amounts = amountMatches.map(amount => {
      // Simple conversion - remove commas and parse
      const clean = amount.replace(/,/g, '');
      return parseInt(clean) || null;
    }).filter(Boolean);
    
    return {
      capitalExpenditure: amounts[0] || null,
      operationalExpenditure: amounts[1] || null,
      rawText: text.substring(0, 500),
    };
  }

  parsePhdStudents(text) {
    const numbers = text.match(/\d+/g) || [];
    return {
      totalPhdStudents: numbers[0] ? parseInt(numbers[0]) : null,
      fullTime: numbers[1] ? parseInt(numbers[1]) : null,
      partTime: numbers[2] ? parseInt(numbers[2]) : null,
      rawText: text.substring(0, 500),
    };
  }

  parsePlacementHigherStudy(text) {
    const numbers = text.match(/\d+/g) || [];
    return {
      studentsPlaced: numbers[0] ? parseInt(numbers[0]) : null,
      medianSalary: numbers[1] ? parseInt(numbers[1]) : null,
      higherStudies: numbers[2] ? parseInt(numbers[2]) : null,
      rawText: text.substring(0, 500),
    };
  }

  parseSanctionedIntake(text) {
    const numbers = text.match(/\d+/g) || [];
    return {
      ug4Year: numbers[0] ? parseInt(numbers[0]) : null,
      ug5Year: numbers[1] ? parseInt(numbers[1]) : null,
      pg2Year: numbers[2] ? parseInt(numbers[2]) : null,
      rawText: text.substring(0, 500),
    };
  }

  parseSponsoredResearch(text) {
    const numbers = text.match(/\d+/g) || [];
    return {
      totalProjects: numbers[0] ? parseInt(numbers[0]) : null,
      totalAmount: numbers[1] ? parseInt(numbers[1]) : null,
      rawText: text.substring(0, 500),
    };
  }

  // Extract parameter values from text using patterns
  extractParameters(text) {
    const extracted = {};
    const confidenceScores = {};
    
    for (const [paramName, pattern] of Object.entries(this.parameterPatterns)) {
      try {
        const match = text.match(pattern);
        if (match) {
          let value = match[1] || match[0];
          
          // Process value based on parameter type
          value = this.processParameterValue(paramName, value);
          
          if (value !== null && value !== undefined) {
            extracted[paramName] = value;
            
            // Calculate confidence score for this parameter
            confidenceScores[paramName] = this.calculateParameterConfidence(paramName, match);
          }
        }
      } catch (error) {
        console.error(`Error extracting parameter ${paramName}:`, error);
      }
    }
    
    return { extracted, confidenceScores };
  }

  // Process parameter value based on type
  processParameterValue(paramName, value) {
    // Clean up value
    value = value.toString().trim();
    
    // Handle different parameter types
    switch (paramName) {
      // Boolean parameters
      case 'liftAvailable':
        return /yes|true/i.test(value);
      
      // Numeric parameters
      case 'placementPercentage':
      case 'studentsGoingForHigherStudies':
      case 'vacancyBoysHostelUG':
      case 'vacancyGirlsHostelUG':
      case 'classroomCapacity':
      case 'labEquipments':
      case 'facultyStrength':
      case 'availableWorkshops':
        const num = parseInt(value.replace(/,/g, ''));
        return isNaN(num) ? null : num;
      
      // Decimal parameters
      case 'landAreaSqKm':
        const decimal = parseFloat(value.replace(/,/g, ''));
        return isNaN(decimal) ? null : decimal;
      
      // Financial parameters (large numbers)
      case 'financialCapacity':
      case 'budgetAllocation':
        const financialNum = parseInt(value.replace(/,/g, ''));
        return isNaN(financialNum) ? null : financialNum;
      
      // Text parameters (already cleaned)
      default:
        return value;
    }
  }

  // Calculate confidence score for a parameter
  calculateParameterConfidence(paramName, match) {
    let confidence = 70; // Base confidence
    
    // Increase confidence for exact matches
    if (match[0].length < 100) {
      confidence += 10;
    }
    
    // Increase confidence for numeric parameters with valid numbers
    const numericParams = [
      'placementPercentage', 'studentsGoingForHigherStudies', 'vacancyBoysHostelUG',
      'vacancyGirlsHostelUG', 'classroomCapacity', 'labEquipments', 'facultyStrength',
      'availableWorkshops', 'financialCapacity', 'budgetAllocation'
    ];
    
    if (numericParams.includes(paramName)) {
      const num = parseInt(match[1]?.replace(/,/g, '') || '0');
      if (!isNaN(num) && num > 0) {
        confidence += 15;
      }
    }
    
    return Math.min(100, confidence);
  }

  calculateConfidenceScore(stats) {
    let score = 0;
    
    // Base score for sections found
    score += stats.sectionsFound * 10;
    
    // Bonus for sections parsed
    score += stats.sectionsParsed * 5;
    
    // Bonus for data points
    score += Math.min(stats.dataPointsExtracted * 2, 30);
    
    // Bonus for parameters extracted
    if (stats.parametersExtracted) {
      score += Math.min(stats.parametersExtracted * 3, 30);
    }
    
    // Cap at 100
    return Math.min(100, score);
  }

  async saveParsedData(documentId, parsedData, stats) {
    try {
      // Get document to get instituteId and year
      const UploadedDocument = (await import("../models/UploadedDocument.model.js")).default;
      const document = await UploadedDocument.findById(documentId);
      
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }
      
      // Create parsed data record
      const parsedDocData = new ParsedDocumentData({
        documentId,
        instituteId: document.instituteId,
        year: document.year,
        rawExtractedData: parsedData,
        dataQualityScore: stats.confidenceScore,
        parsingVersion: "1.0",
      });
      
      // Save to database
      await parsedDocData.save();
      
      // Update document with parsed data reference
      document.parsedData = parsedDocData._id;
      await document.save();
      
      return parsedDocData;
    } catch (error) {
      console.error("Error saving parsed data:", error);
      throw error;
    }
  }

  // Save extracted parameters to InstituteData for verification
  async saveExtractedParameters(documentId, extractedData, overallConfidence) {
    try {
      const UploadedDocument = (await import("../models/UploadedDocument.model.js")).default;
      const document = await UploadedDocument.findById(documentId);
      
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }
      
      const { extracted, confidenceScores } = extractedData;
      
      // Find or create InstituteData record
      let instituteData = await InstituteData.findOne({
        instituteId: document.instituteId,
        academicYear: document.year,
      });
      
      if (!instituteData) {
        instituteData = new InstituteData({
          instituteId: document.instituteId,
          academicYear: document.year,
          source: "PDF_PARSER",
        });
      }
      
      // Convert extracted object to Map for InstituteData model
      const extractedMap = new Map();
      for (const [key, value] of Object.entries(extracted)) {
        extractedMap.set(key, value);
      }
      
      // Set extracted parameters
      await instituteData.setExtractedParameters(
        extractedMap,
        "PDF_PARSER",
        overallConfidence,
        {
          extractedBy: "pdf_parser_service",
          rawSource: documentId,
          confidenceScores,
        }
      );
      
      console.log(`Extracted ${extractedMap.size} parameters for verification`);
      return instituteData;
    } catch (error) {
      console.error("Error saving extracted parameters:", error);
      throw error;
    }
  }

  // Advanced parsing methods (to be implemented based on actual PDF structure)
  parseTable(text) {
    // TODO: Implement table parsing logic
    return {};
  }

  extractYearData(text, year) {
    // TODO: Implement year-specific data extraction
    return {};
  }
}

export default new PDFParserService();
