import React from 'react';
import { Link } from 'react-router-dom';
// Assuming these chart components exist:
import AIIMSDPerformanceRadar from '../components/AIIMSDPerformanceRadar';
import AIIMSDPerceptionFSRChart from '../components/AIIMSDPerceptionFSRChart';
import AIIMSDResearchMetricsChart from '../components/AIIMSDResearchMetricsChart';
import GraduationPillarsChart from '../components/GraduationPillarsChart';

const PRIMARY_BLUE = '#4F46E5'; 
const DEEP_INDIGO = '#3730A3';

/**
 * Simple Card wrapper component for consistent UI styling
 */
const Card = ({ title, description, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col">
        <h2 className="text-xl font-semibold mb-2" style={{ color: DEEP_INDIGO }}>{title}</h2>
        <p className="text-sm text-gray-500 mb-4 flex-grow">{description}</p>
        <div className="mt-auto">
            {children}
        </div>
    </div>
);


/**
 * Renders the AIIMS Delhi Analytical Dashboard in a 2x2 grid.
 */
const AIIMSDashboard = () => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 min-h-screen">
            <header className="text-center mb-12 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h1 className="text-4xl font-extrabold" style={{ color: DEEP_INDIGO }}>
                    AIIMS Delhi: Performance Metrics Dashboard (2021-2025) 📊
                </h1>
                <p className="mt-3 text-lg text-gray-600">
                    Comparative analysis of core academic, research, and placement indicators.
                </p>
                <Link to="/" className="inline-block mt-4 text-sm font-medium px-4 py-2 rounded-lg text-white" style={{ backgroundColor: PRIMARY_BLUE }}>
                    ← Back to Rankings Table
                </Link>
            </header>

            {/* 2x2 Grid Layout for Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Row 1, Column 1: Radar Chart (2021 vs 2025 Comparison) */}
                <Card 
                    title="Comparative Performance Radar: 2021 vs 2025"
                    description="Visualizes the shift in scores across 10 key metrics (IPR, RD, Quality) from the initial to the final year. Highlights the critical contraction in Innovation (IPR) and Diversity (RD) against sustained Excellence (PU, QP)."
                >
                    <AIIMSDPerformanceRadar />
                </Card>

                {/* Row 1, Column 2: Graduation Pillars Chart (Stability Check) */}
                <Card 
                    title="Graduation Outcome Pillars Stability (GPH, GUE, GSS)"
                    description="Tracks PhD Graduates (GPH), Entrant Retention (GUE), and Lateral Entry (GSS). Shows GUE is perfectly stable, confirming near-zero dropout, and GSS/GPH optimization post-2021."
                >
                    <GraduationPillarsChart />
                </Card>

                {/* Row 2, Column 1: Research Metrics Chart (Conflict) */}
                <Card 
                    title="Research Conflict: Publication Excellence vs. Innovation Decline"
                    description="Contrasts the consistently perfect score in Quality of Publication (QP) with the substantial and volatile decline in Intellectual Property Rights (IPR). Pinpoints a major structural weakness in patent filing."
                >
                    <AIIMSDResearchMetricsChart />
                </Card>

                {/* Row 2, Column 2: Perception/FSR Chart (Foundation) */}
                <Card 
                    title="Core Academic Quality and Perception Stability"
                    description="Compares the foundational metrics: Faculty-Student Ratio (FSR), Perception (PU), and Faculty Quality Experience (FQE). Demonstrates unshakeable strength in FSR and PU (Perception)."
                >
                    <AIIMSDPerceptionFSRChart />
                </Card>
                
            </div>
        </div>
    );
}

export default AIIMSDashboard;