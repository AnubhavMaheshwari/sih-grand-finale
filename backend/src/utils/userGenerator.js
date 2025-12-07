const INSTITUTE_TYPE_ABBR = {
  engineering: 'ENG',
  management: 'MGT',
  medical: 'MED',
  others: 'OTH'
};

// Character sets for password generation
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijkmnpqrstuvwxyz';
const NUMBERS = '23456789';
const SYMBOLS = '!@#$%&*?';

const generateUserId = (userData, sequenceNumber = null) => {
  const { role, instituteType = 'others' } = userData;
  
  if (role === 'institute') {
    const typeCode = instituteType === 'engineering' ? 'EN' :
                    instituteType === 'management' ? 'MG' :
                    instituteType === 'medical' ? 'MD' : 'IN';
    const randomNumbers = Math.floor(100000 + Math.random() * 900000);
    return `${typeCode}${randomNumbers}`;
  } else if (role === 'ugc_employee') {
    const seq = sequenceNumber ? sequenceNumber.toString().padStart(6, '0') : 
               Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
    return `UGCM${seq}`;
  } else if (role === 'admin') {
    const randomNumbers = Math.floor(100000 + Math.random() * 900000);
    return `ADMN${randomNumbers}`;
  }
  
  // Fallback: generic ID (2 letters + 6 numbers)
  const randomLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter1 = randomLetters[Math.floor(Math.random() * randomLetters.length)];
  const letter2 = randomLetters[Math.floor(Math.random() * randomLetters.length)];
  const randomNumbers = Math.floor(100000 + Math.random() * 900000);
  return `${letter1}${letter2}${randomNumbers}`;
};


const generatePassword = (length = 12) => {
  const allChars = UPPERCASE + LOWERCASE + NUMBERS + SYMBOLS;
  let password = '';
  
  password += UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)];
  password += LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)];
  password += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
  
  password += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  password = password.split('').sort(() => Math.random() - 0.5).join('');
  
  return password;
};


const validatePassword = (password, config = {}) => {
  const {
    MIN_LENGTH = 8,
    REQUIRE_UPPERCASE = true,
    REQUIRE_LOWERCASE = true,
    REQUIRE_NUMBERS = true,
    REQUIRE_SPECIAL_CHARS = false
  } = config;
  
  if (password.length < MIN_LENGTH) {
    return { isValid: false, message: `Password must be at least ${MIN_LENGTH} characters long` };
  }
  
  if (REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  
  if (REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }
  
  if (REQUIRE_NUMBERS && !/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  
  if (REQUIRE_SPECIAL_CHARS && !/[!@#$%&*?]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character (!@#$%&*?)" };
  }
  
  return { isValid: true, message: "Password is valid" };
};



const generateMemorablePassword = () => {
  const adjectives = ['Swift', 'Bright', 'Calm', 'Brave', 'Wise', 'Quick', 'Smart', 'Clear'];
  const nouns = ['Tiger', 'Eagle', 'River', 'Mountain', 'Ocean', 'Forest', 'Star', 'Cloud'];
  const numbers = Math.floor(100 + Math.random() * 900); // 3-digit number
  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}${noun}${numbers}${symbol}`;
};

const userIdExists = async (UserModel, userId) => {
  const existingUser = await UserModel.findOne({ userId });
  return !!existingUser;
};

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
  validatePassword,
  INSTITUTE_TYPE_ABBR
};
