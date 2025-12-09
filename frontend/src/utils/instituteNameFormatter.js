// Utility function to format institute names
export const formatInstituteName = (name) => {
    if (!name) return '';

    // Mapping for common institute short codes to full names
    const instituteNameMap = {
        'nitjsr': 'NIT Jamshedpur',
        'nit jamshedpur': 'NIT Jamshedpur',
        'iitd': 'IIT Delhi',
        'iit delhi': 'IIT Delhi',
        'iitb': 'IIT Bombay',
        'iit bombay': 'IIT Bombay',
        'iitm': 'IIT Madras',
        'iit madras': 'IIT Madras',
        'iitk': 'IIT Kanpur',
        'iit kanpur': 'IIT Kanpur',
        'iitkgp': 'IIT Kharagpur',
        'iit kharagpur': 'IIT Kharagpur',
        'iitr': 'IIT Roorkee',
        'iit roorkee': 'IIT Roorkee',
        'iitg': 'IIT Guwahati',
        'iit guwahati': 'IIT Guwahati',
        'nitt': 'NIT Trichy',
        'nit trichy': 'NIT Trichy',
        'nitk': 'NIT Karnataka',
        'nit karnataka': 'NIT Karnataka',
        'nitw': 'NIT Warangal',
        'nit warangal': 'NIT Warangal',
    };

    // Check if there's a mapping for the lowercase name
    const mappedName = instituteNameMap[name.toLowerCase()];
    if (mappedName) {
        return mappedName;
    }

    // Otherwise, capitalize each word
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};
