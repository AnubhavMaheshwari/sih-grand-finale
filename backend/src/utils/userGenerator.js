/**
 * Utility functions for generating professional User IDs and passwords
 */

// Institute type abbreviations
const INSTITUTE_TYPE_ABBR = {
  engineering: 'ENG',
  management: 'MGT',
  medical: 'MED',
  others: 'OTH'
};

// Character sets for password generation
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I and O for clarity
const LOWERCASE = 'abcdefghijkmnpqrstuvwxyz'; // Removed l and o for clarity
const NUMBERS = '23456789'; // Removed 0 and 1 for clarity
const SYMBOLS = '!@#$%&*?';

/**
 * Generate a professional User ID based on user role and details
 * @param {Object} userData - User data including role, instituteType, instituteId
 * @param {number} sequenceNumber - Sequential number for UGC employees
 * @returns {string} Generated User ID
 */
const generateUserId = (userData, sequenceNumber = null) => {
  const { role, instituteType = 'others' } = userData;
  
  if (role === 'institute') {
    // For institute users: 2 letters (institute type code) + 6 random numbers
    // e.g., EN123456 for engineering, MG123456 for management
    const typeCode = instituteType === 'engineering' ? 'EN' :
                    instituteType === 'management' ? 'MG' :
                    instituteType === 'medical' ? 'MD' : 'IN';
    const randomNumbers = Math.floor(100000 + Math.random() * 900000); // 6-digit random
    return `${typeCode}${randomNumbers}`;
  } else if (role === 'ugc_employee') {
    // For UGC employees: UGCM + 6-digit sequential number
    // e.g., UGCM000001, UGCM000002
    const seq = sequenceNumber ? sequenceNumber.toString().padStart(6, '0') : 
               Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
    return `UGCM${seq}`;
  } else if (role === 'admin') {
    // For admin users: ADMN + 6-digit random number
    // e.g., ADMN123456
    const randomNumbers = Math.floor(100000 + Math.random() * 900000); // 6-digit random
    return `ADMN${randomNumbers}`;
  }
  
  // Fallback: generic ID (2 letters + 6 numbers)
  const randomLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter1 = randomLetters[Math.floor(Math.random() * randomLetters.length)];
  const letter2 = randomLetters[Math.floor(Math.random() * randomLetters.length)];
  const randomNumbers = Math.floor(100000 + Math.random() * 900000);
  return `${letter1}${letter2}${randomNumbers}`;
};

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} Generated password
 */
const generatePassword = (length = 12) => {
  const allChars = UPPERCASE + LOWERCASE + NUMBERS + SYMBOLS;
  let password = '';
  
  // Ensure at least one character from each set
  password += UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)];
  password += LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)];
  password += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
  password += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  
  // Fill the rest with random characters from all sets
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to avoid predictable pattern
  password = password.split('').sort(() => Math.random() - 0.5).join('');
  
  return password;
};

/**
 * Generate a memorable but secure password (alternative)
 * @returns {string} Memorable password
 */
const generateMemorablePassword = () => {
  const adjectives = ['Swift', 'Bright', 'Calm', 'Brave', 'Wise', 'Quick', 'Smart', 'Clear'];
  const nouns = ['Tiger', 'Eagle', 'River', 'Mountain', 'Ocean', 'Forest', 'Star', 'Cloud'];
  const numbers = Math.floor(100 + Math.random() * 900); // 3-digit number
  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}${noun}${numbers}${symbol}`;
};

/**
 * Check if a User ID already exists in the database
 * @param {Model} UserModel - Mongoose User model
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} True if exists
 */
const userIdExists = async (UserModel, userId) => {
  const existingUser = await UserModel.findOne({ userId });
  return !!existingUser;
};

/**
 * Generate a unique User ID (with retry logic)
 * @param {Model} UserModel - Mongoose User model
 * @param {Object} userData - User data
 * @param {number} maxAttempts - Maximum attempts to generate unique ID
 * @returns {Promise<string>} Unique User ID
 */
const generateUniqueUserId = async (UserModel, userData, maxAttempts = 5) => {
  let attempts = 0;
  let userId;
  
  while (attempts < maxAttempts) {
    // For UGC employees, we need to get the next sequence number
    let sequenceNumber = null;
    if (userData.role === 'ugc_employee') {
      // Find the highest UGC employee sequence number
      const lastUgcUser = await UserModel.findOne(
        { role: 'ugc_employee', userId: /^UGCM/ },
        { userId: 1 }
      ).sort({ createdAt: -1 });
      
      if (lastUgcUser && lastUgcUser.userId) {
        const match = lastUgcUser.userId.match(/UGCM(\d+)/);
        if (match && match[1]) {
          sequenceNumber = parseInt(match[1]) + 1;
        }
      }
      
      if (!sequenceNumber) {
        sequenceNumber = 1; // Start from 1
      }
    }
    
    userId = generateUserId(userData, sequenceNumber);
    
    const exists = await userIdExists(UserModel, userId);
    if (!exists) {
      return userId;
    }
    
    attempts++;
  }
  
  // If all attempts fail, use timestamp-based ID
  return `USER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export {
  generateUserId,
  generatePassword,
  generateMemorablePassword,
  userIdExists,
  generateUniqueUserId,
  INSTITUTE_TYPE_ABBR
};
