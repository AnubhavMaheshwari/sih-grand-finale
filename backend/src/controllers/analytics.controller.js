import ParsedDocumentData from "../models/ParsedDocumentData.model.js";
import UploadedDocument from "../models/UploadedDocument.model.js";
import FacultyDetails from "../models/facultydetails.model.js";
import StudentStrength from "../models/studentstrength.model.js";
import FinancialResources from "../models/financialresources.model.js";
import PhdStudents from "../models/phdstudents.model.js";
import PlacementHigherStudy from "../models/placement&higherstudy.model.js";
import SanctionedIntake from "../models/sanctionedIntake.model.js";
import SponseredResearch from "../models/sponseredresearch.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// Get institute analytics overview
const getInstituteAnalytics = async (req, res) => {
  try {
    const instituteId = req.user?.instituteId || req.params.instituteId;
    if (!instituteId) {
      return errorResponse(res, "Institute ID is required", 400);
    }

    // Get all parsed data for this institute
    const parsedData = await ParsedDocumentData.find({ instituteId })
      .sort({ year: -1 })
      .lean();

    if (parsedData.length === 0) {
      return successResponse(res, {
        analytics: {
          instituteId,
          totalDocuments: 0,
          yearsAvailable: [],
          overview: {},
          trends: {},
          recommendations: [],
        },
        message: "No data available for analytics",
      });
    }

    // Group data by year
    const dataByYear = {};
    parsedData.forEach((data) => {
      if (!dataByYear[data.year]) {
        dataByYear[data.year] = [];
      }
      dataByYear[data.year].push(data);
    });

    // Calculate overview metrics
    const overview = calculateOverviewMetrics(parsedData);
    const trends = calculateTrends(dataByYear);
    const recommendations = generateRecommendations(overview, trends);

    return successResponse(res, {
      analytics: {
        instituteId,
        totalDocuments: parsedData.length,
        yearsAvailable: Object.keys(dataByYear).sort((a, b) => b - a),
        overview,
        trends,
        recommendations,
        lastUpdated: new Date(),
      },
      message: "Analytics retrieved successfully",
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return errorResponse(res, error.message || "Failed to retrieve analytics", 500);
  }
};

// Get specific metric trends
const getMetricTrends = async (req, res) => {
  try {
    const instituteId = req.user?.instituteId || req.params.instituteId;
    const { metric } = req.params;
    
    if (!instituteId) {
      return errorResponse(res, "Institute ID is required", 400);
    }

    if (!metric) {
      return errorResponse(res, "Metric name is required", 400);
    }

    const parsedData = await ParsedDocumentData.find({ instituteId })
      .sort({ year: 1 })
      .lean();

    if (parsedData.length === 0) {
      return successResponse(res, {
        metric,
        instituteId,
        dataPoints: [],
        message: "No data available for this metric",
      });
    }

    // Extract metric data
    const dataPoints = extractMetricData(parsedData, metric);

    return successResponse(res, {
      metric,
      instituteId,
      dataPoints,
      message: "Metric trends retrieved successfully",
    });
  } catch (error) {
    console.error("Get metric trends error:", error);
    return errorResponse(res, error.message || "Failed to retrieve metric trends", 500);
  }
};

// Compare with peer institutes
const getPeerComparison = async (req, res) => {
  try {
    const instituteId = req.user?.instituteId || req.params.instituteId;
    const { year } = req.query;
    
    if (!instituteId) {
      return errorResponse(res, "Institute ID is required", 400);
    }

    // Get current institute data
    const currentInstituteData = await ParsedDocumentData.findOne({
      instituteId,
      year: year || new Date().getFullYear(),
    }).lean();

    if (!currentInstituteData) {
      return successResponse(res, {
        instituteId,
        year: year || new Date().getFullYear(),
        comparison: null,
        message: "No data available for comparison",
      });
    }

    // Get peer institutes data (for demo, we'll use sample data)
    // In production, this would query other institutes
    const peerData = await generatePeerComparisonData(currentInstituteData);

    return successResponse(res, {
      instituteId,
      year: year || new Date().getFullYear(),
      comparison: {
        currentInstitute: extractComparisonMetrics(currentInstituteData),
        peers: peerData,
        percentileRank: calculatePercentileRank(currentInstituteData, peerData),
      },
      message: "Peer comparison retrieved successfully",
    });
  } catch (error) {
    console.error("Get peer comparison error:", error);
    return errorResponse(res, error.message || "Failed to retrieve peer comparison", 500);
  }
};

// Get compliance status
const getComplianceStatus = async (req, res) => {
  try {
    const instituteId = req.user?.instituteId || req.params.instituteId;
    const { year } = req.query;
    
    if (!instituteId) {
      return errorResponse(res, "Institute ID is required", 400);
    }

    // Get data for the specified year
    const query = { instituteId };
    if (year) query.year = parseInt(year);

    const parsedData = await ParsedDocumentData.find(query)
      .sort({ year: -1 })
      .limit(1)
      .lean();

    if (parsedData.length === 0) {
      return successResponse(res, {
        instituteId,
        year: year || "latest",
        compliance: null,
        message: "No data available for compliance check",
      });
    }

    const latestData = parsedData[0];
    const compliance = checkCompliance(latestData);

    return successResponse(res, {
      instituteId,
      year: latestData.year,
      compliance,
      message: "Compliance status retrieved successfully",
    });
  } catch (error) {
    console.error("Get compliance status error:", error);
    return errorResponse(res, error.message || "Failed to retrieve compliance status", 500);
  }
};

// Helper functions
function calculateOverviewMetrics(parsedData) {
  const overview = {
    studentMetrics: {
      totalStudents: 0,
      growthRate: 0,
      genderRatio: { male: 0, female: 0 },
    },
    facultyMetrics: {
      totalFaculty: 0,
      studentFacultyRatio: 0,
    },
    financialMetrics: {
      totalBudget: 0,
      perStudentExpenditure: 0,
    },
    researchMetrics: {
      totalProjects: 0,
      totalFunding: 0,
    },
    placementMetrics: {
      placementRate: 0,
      medianSalary: 0,
      higherStudiesRate: 0,
    },
  };

  // Use the latest data for overview
  const latestData = parsedData[0]?.rawExtractedData;
  if (latestData) {
    // Student metrics
    if (latestData.studentStrength) {
      overview.studentMetrics.totalStudents = 
        latestData.studentStrength.totalStudents || 0;
      overview.studentMetrics.genderRatio.male = 
        latestData.studentStrength.maleStudents || 0;
      overview.studentMetrics.genderRatio.female = 
        latestData.studentStrength.femaleStudents || 0;
    }

    // Faculty metrics
    if (latestData.facultyDetails) {
      overview.facultyMetrics.totalFaculty = 
        latestData.facultyDetails.totalFaculty || 0;
      if (overview.studentMetrics.totalStudents > 0 && overview.facultyMetrics.totalFaculty > 0) {
        overview.facultyMetrics.studentFacultyRatio = 
          overview.studentMetrics.totalStudents / overview.facultyMetrics.totalFaculty;
      }
    }

    // Financial metrics
    if (latestData.financialResources) {
      const capital = latestData.financialResources.capitalExpenditure || 0;
      const operational = latestData.financialResources.operationalExpenditure || 0;
      overview.financialMetrics.totalBudget = capital + operational;
      if (overview.studentMetrics.totalStudents > 0) {
        overview.financialMetrics.perStudentExpenditure = 
          overview.financialMetrics.totalBudget / overview.studentMetrics.totalStudents;
      }
    }

    // Research metrics
    if (latestData.sponsoredResearch) {
      overview.researchMetrics.totalProjects = 
        latestData.sponsoredResearch.totalProjects || 0;
      overview.researchMetrics.totalFunding = 
        latestData.sponsoredResearch.totalAmount || 0;
    }

    // Placement metrics
    if (latestData.placementHigherStudy) {
      const placed = latestData.placementHigherStudy.studentsPlaced || 0;
      const total = overview.studentMetrics.totalStudents;
      overview.placementMetrics.placementRate = total > 0 ? (placed / total) * 100 : 0;
      overview.placementMetrics.medianSalary = 
        latestData.placementHigherStudy.medianSalary || 0;
      overview.placementMetrics.higherStudiesRate = 
        latestData.placementHigherStudy.higherStudies || 0;
    }
  }

  return overview;
}

function calculateTrends(dataByYear) {
  const trends = {
    studentGrowth: [],
    facultyGrowth: [],
    budgetGrowth: [],
    researchGrowth: [],
    placementTrend: [],
  };

  const years = Object.keys(dataByYear).sort((a, b) => a - b);
  
  years.forEach((year) => {
    const yearData = dataByYear[year];
    const latestData = yearData[0]?.rawExtractedData;
    
    if (latestData) {
      trends.studentGrowth.push({
        year: parseInt(year),
        value: latestData.studentStrength?.totalStudents || 0,
      });
      
      trends.facultyGrowth.push({
        year: parseInt(year),
        value: latestData.facultyDetails?.totalFaculty || 0,
      });
      
      const capital = latestData.financialResources?.capitalExpenditure || 0;
      const operational = latestData.financialResources?.operationalExpenditure || 0;
      trends.budgetGrowth.push({
        year: parseInt(year),
        value: capital + operational,
      });
      
      trends.researchGrowth.push({
        year: parseInt(year),
        value: latestData.sponsoredResearch?.totalProjects || 0,
      });
      
      trends.placementTrend.push({
        year: parseInt(year),
        value: latestData.placementHigherStudy?.studentsPlaced || 0,
      });
    }
  });

  return trends;
}

function generateRecommendations(overview, trends) {
  const recommendations = [];

  // Student-faculty ratio recommendation
  const studentFacultyRatio = overview.facultyMetrics.studentFacultyRatio;
  if (studentFacultyRatio > 20) {
    recommendations.push({
      category: "Faculty Resources",
      priority: "high",
      title: "Improve Student-Faculty Ratio",
      description: `Current ratio is ${studentFacultyRatio.toFixed(1)}:1. Consider hiring additional faculty to reach the recommended 15:1 ratio.`,
      action: "Plan faculty recruitment for next academic year",
    });
  }

  // Placement rate recommendation
  const placementRate = overview.placementMetrics.placementRate;
  if (placementRate < 70) {
    recommendations.push({
      category: "Placement & Career",
      priority: "medium",
      title: "Enhance Placement Support",
      description: `Current placement rate is ${placementRate.toFixed(1)}%. Consider strengthening industry partnerships and career counseling.`,
      action: "Establish industry mentorship program",
    });
  }

  // Research funding recommendation
  const researchFunding = overview.researchMetrics.totalFunding;
  if (researchFunding < 1000000) { // Less than 1 million
    recommendations.push({
      category: "Research & Innovation",
      priority: "medium",
      title: "Increase Research Funding",
      description: "Current research funding is below average. Focus on applying for government and industry grants.",
      action: "Organize grant writing workshop for faculty",
    });
  }

  // Budget per student recommendation
  const perStudentBudget = overview.financialMetrics.perStudentExpenditure;
  if (perStudentBudget < 50000) { // Less than 50,000 per student
    recommendations.push({
      category: "Financial Resources",
      priority: "low",
      title: "Optimize Resource Allocation",
      description: "Per student expenditure could be optimized. Review budget allocation across departments.",
      action: "Conduct departmental budget review",
    });
  }

  return recommendations;
}

function extractMetricData(parsedData, metric) {
  const dataPoints = [];

  parsedData.forEach((data) => {
    const yearData = data.rawExtractedData;
    let value = null;

    switch (metric) {
      case "student_strength":
        value = yearData.studentStrength?.totalStudents;
        break;
      case "faculty_count":
        value = yearData.facultyDetails?.totalFaculty;
        break;
      case "placement_rate":
        const placed = yearData.placementHigherStudy?.studentsPlaced || 0;
        const total = yearData.studentStrength?.totalStudents || 0;
        value = total > 0 ? (placed / total) * 100 : 0;
        break;
      case "research_projects":
        value = yearData.sponsoredResearch?.totalProjects;
        break;
      case "budget":
        const capital = yearData.financialResources?.capitalExpenditure || 0;
        const operational = yearData.financialResources?.operationalExpenditure || 0;
        value = capital + operational;
        break;
      case "phd_students":
        value = yearData.phdStudents?.totalPhdStudents;
        break;
      default:
        value = null;
    }

    if (value !== null) {
      dataPoints.push({
        year: data.year,
        value,
        dataQuality: data.dataQualityScore,
      });
    }
  });

  return dataPoints.sort((a, b) => a.year - b.year);
}

function generatePeerComparisonData(currentData) {
  // For demo purposes, generate synthetic peer data
  // In production, this would query actual peer institutes
  const peers = [
    { name: "Peer Institute A", type: "similar_size", metrics: generateRandomMetrics(currentData, 0.9) },
    { name: "Peer Institute B", type: "top_performer", metrics: generateRandomMetrics(currentData, 1.2) },
    { name: "Peer Institute C", type: "similar_region", metrics: generateRandomMetrics(currentData, 0.95) },
    { name: "Peer Institute D", type: "aspirational", metrics: generateRandomMetrics(currentData, 1.3) },
  ];

  return peers;
}

function generateRandomMetrics(baseData, multiplier) {
  const metrics = {};
  
  if (baseData.rawExtractedData.studentStrength?.totalStudents) {
    metrics.studentStrength = Math.round(baseData.rawExtractedData.studentStrength.totalStudents * multiplier);
  }
  
  if (baseData.rawExtractedData.facultyDetails?.totalFaculty) {
    metrics.facultyCount = Math.round(baseData.rawExtractedData.facultyDetails.totalFaculty * multiplier);
  }
  
  if (baseData.rawExtractedData.placementHigherStudy?.studentsPlaced) {
    metrics.placementCount = Math.round(baseData.rawExtractedData.placementHigherStudy.studentsPlaced * multiplier);
  }
  
  if (baseData.rawExtractedData.sponsoredResearch?.totalProjects) {
    metrics.researchProjects = Math.round(baseData.rawExtractedData.sponsoredResearch.totalProjects * multiplier);
  }
  
  return metrics;
}

function extractComparisonMetrics(data) {
  return {
    studentStrength: data.rawExtractedData.studentStrength?.totalStudents || 0,
    facultyCount: data.rawExtractedData.facultyDetails?.totalFaculty || 0,
    placementCount: data.rawExtractedData.placementHigherStudy?.studentsPlaced || 0,
    researchProjects: data.rawExtractedData.sponsoredResearch?.totalProjects || 0,
    phdStudents: data.rawExtractedData.phdStudents?.totalPhdStudents || 0,
    budget: (data.rawExtractedData.financialResources?.capitalExpenditure || 0) + 
            (data.rawExtractedData.financialResources?.operationalExpenditure || 0),
  };
}

function calculatePercentileRank(currentData, peerData) {
  // Simplified percentile calculation
  // In production, this would use actual statistical methods
  const currentMetrics = extractComparisonMetrics(currentData);
  const peerMetrics = peerData.map(peer => peer.metrics);
  
  // For demo, return a fixed percentile
  return {
    overall: 65,
    studentStrength: 70,
    facultyCount: 60,
    placementCount: 75,
    researchProjects: 55,
    phdStudents: 65,
    budget: 50,
  };
}

function checkCompliance(data) {
  const compliance = {
    overallScore: 0,
    categories: [],
    status: "compliant", // compliant, partially_compliant, non_compliant
  };

  const categories = [];
  let totalScore = 0;
  let categoryCount = 0;

  // Check student data compliance
  if (data.rawExtractedData.studentStrength) {
    const score = data.rawExtractedData.studentStrength.totalStudents ? 100 : 0;
    categories.push({
      name: "Student Data",
      score,
      status: score >= 80 ? "compliant" : score >= 50 ? "partially_compliant" : "non_compliant",
      requirements: ["Total student count", "Gender distribution"],
      met: data.rawExtractedData.studentStrength.totalStudents ? ["Total student count"] : [],
    });
    totalScore += score;
    categoryCount++;
  }

  // Check faculty data compliance
  if (data.rawExtractedData.facultyDetails) {
    const score = data.rawExtractedData.facultyDetails.totalFaculty ? 100 : 0;
    categories.push({
      name: "Faculty Data",
      score,
      status: score >= 80 ? "compliant" : score >= 50 ? "partially_compliant" : "non_compliant",
      requirements: ["Total faculty count"],
      met: data.rawExtractedData.facultyDetails.totalFaculty ? ["Total faculty count"] : [],
    });
    totalScore += score;
    categoryCount++;
  }

  // Check financial data compliance
  if (data.rawExtractedData.financialResources) {
    const capital = data.rawExtractedData.financialResources.capitalExpenditure;
    const operational = data.rawExtractedData.financialResources.operationalExpenditure;
    const hasData = capital || operational;
    const score = hasData ? 100 : 0;
    categories.push({
      name: "Financial Data",
      score,
      status: score >= 80 ? "compliant" : score >= 50 ? "partially_compliant" : "non_compliant",
      requirements: ["Capital expenditure", "Operational expenditure"],
      met: hasData ? ["Financial data"] : [],
    });
    totalScore += score;
    categoryCount++;
  }

  // Check placement data compliance
  if (data.rawExtractedData.placementHigherStudy) {
    const hasData = data.rawExtractedData.placementHigherStudy.studentsPlaced;
    const score = hasData ? 100 : 0;
    categories.push({
      name: "Placement Data",
      score,
      status: score >= 80 ? "compliant" : score >= 50 ? "partially_compliant" : "non_compliant",
      requirements: ["Placement count", "Higher studies count"],
      met: hasData ? ["Placement count"] : [],
    });
    totalScore += score;
    categoryCount++;
  }

  // Calculate overall score
  compliance.overallScore = categoryCount > 0 ? Math.round(totalScore / categoryCount) : 0;
  compliance.categories = categories;
  
  // Determine overall status
  if (compliance.overallScore >= 80) {
    compliance.status = "compliant";
  } else if (compliance.overallScore >= 50) {
    compliance.status = "partially_compliant";
  } else {
    compliance.status = "non_compliant";
  }

  return compliance;
}

export {
  getInstituteAnalytics,
  getMetricTrends,
  getPeerComparison,
  getComplianceStatus,
};
