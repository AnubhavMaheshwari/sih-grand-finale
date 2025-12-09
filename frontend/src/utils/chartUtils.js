// ----------------- CHART HELPERS -----------------
export const formatCr = (value) => (value / 10000000).toFixed(2); // 1 Cr = 1,00,00,000
export const formatCrLabel = (value) => `${formatCr(value)} Cr`;

// Color palette for charts
export const CHART_COLORS = {
  library: "#6366F1", // Indigo
  labs: "#EC4899", // Pink
  workshops: "#F59E0B", // Amber
  otherAssets: "#10B981", // Emerald
  salaries: "#F43F5E", // Rose
  maintenance: "#06B6D4", // Cyan
  capital: "#8B5CF6", // Violet
  operational: "#F97316", // Orange
};

export const PIE_COLORS = [
  CHART_COLORS.library,
  CHART_COLORS.labs,
  CHART_COLORS.workshops,
  CHART_COLORS.otherAssets,
];

export const axisStyles = {
  x: {
    stroke: "#111827",
    tick: { fill: "#374151", fontSize: 12 },
  },
  y: {
    stroke: "#111827",
    tick: { fill: "#374151", fontSize: 12 },
  },
};

export const gridStyle = {
  strokeDasharray: "3 3",
  stroke: "#E5E7EB",
};

// Transform backend data for charts
export const transformFinancialData = (backendData) => {
  if (!backendData || !backendData.capitalByYear) {
    return null;
  }

  const { capitalByYear, operationalByYear } = backendData;

  // Calculate capVsOpByYear if not provided
  // Calculate capVsOpByYear if not provided
  const capVsOpByYear = capitalByYear.map((capRow, idx) => {
    // Try to match operational row by year, not just index
    const opRow = operationalByYear?.find(op => op.year === capRow.year) || operationalByYear?.[idx] || {};

    // Sum breakdown if available, else use raw sums if passed (usually not passed here, but good to be safe)
    let capitalTotal = (capRow.library || 0) + (capRow.labs || 0) + (capRow.workshops || 0) + (capRow.otherAssets || 0);

    // If sum is 0 but we have a 'capital' field (unlikely with current backend), use it? 
    // Actually backend sends breakdown that SUMS up to total. So this is fine.

    let operationalTotal = (opRow.salaries || 0) + (opRow.maintenance || 0);

    return {
      year: capRow.year,
      capital: capitalTotal,
      operational: operationalTotal,
    };
  });

  // Calculate capital2023Breakdown
  const capital2023 = capitalByYear.find((d) => d.year === "2023-24");
  const capital2023Breakdown = capital2023 ? [
    { name: "Library", value: capital2023.library },
    { name: "Labs", value: capital2023.labs },
    { name: "Workshops", value: capital2023.workshops },
    { name: "Other Capital Assets", value: capital2023.otherAssets },
  ] : [];

  return {
    capitalByYear,
    operationalByYear: operationalByYear || [],
    capVsOpByYear,
    capital2023Breakdown,
  };
};
