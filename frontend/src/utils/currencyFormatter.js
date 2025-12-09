/**
 * Format number in Indian numbering system
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted string with ₹ symbol and Lakh/Crore notation
 */
export const formatIndianCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "N/A";

    const num = Number(amount);

    // Crore (10,000,000)
    if (num >= 10000000) {
        const crores = (num / 10000000).toFixed(0);
        return `₹${crores} Cr`;
    }

    // Lakh (100,000)
    if (num >= 100000) {
        const lakhs = (num / 100000).toFixed(0);
        return `₹${lakhs} L`;
    }

    // Thousand
    if (num >= 1000) {
        const thousands = (num / 1000).toFixed(0);
        return `₹${thousands}K`;
    }

    // Less than thousand
    return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Format number in Indian numbering system without currency symbol
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted string with Lakh/Crore notation
 */
export const formatIndianNumber = (amount) => {
    if (!amount || isNaN(amount)) return "N/A";

    const num = Number(amount);

    // Crore (10,000,000)
    if (num >= 10000000) {
        const crores = (num / 10000000).toFixed(0);
        return `${crores} Cr`;
    }

    // Lakh (100,000)
    if (num >= 100000) {
        const lakhs = (num / 100000).toFixed(0);
        return `${lakhs} L`;
    }

    // Thousand
    if (num >= 1000) {
        const thousands = (num / 1000).toFixed(0);
        return `${thousands}K`;
    }

    // Less than thousand
    return num.toLocaleString('en-IN');
};
