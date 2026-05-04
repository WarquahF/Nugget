// J.A.R.V.I.S Backend Configuration
// Handles secure loading of environment variables and configuration

require('dotenv').config();

const config = {
  // Email Configuration
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'jarvis@assistant.com',
    service: 'gmail'
  },

  // AI/LLM Configuration
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY
    },
    google: {
      apiKey: process.env.GOOGLE_AI_API_KEY
    }
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET,
    encryptionKey: process.env.ENCRYPTION_KEY
  },

  // Application Settings
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3001,
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // Contact Information (moved from frontend for security)
  contacts: {
    sister: process.env.CONTACT_SISTER,
    father: process.env.CONTACT_FATHER,
    mother: process.env.CONTACT_MOTHER,
    brother: process.env.CONTACT_BROTHER,
    friend: process.env.CONTACT_FRIEND,
    boss: process.env.CONTACT_BOSS,
    colleague: process.env.CONTACT_COLLEAGUE
  },

  // Application Launcher Settings
  launcher: {
    allowedApps: [
      'chrome', 'firefox', 'msedge', 'safari',
      'discord', 'slack', 'zoom', 'teams', 'telegram', 'whatsapp',
      'notepad', 'winword', 'excel', 'powerpnt', 'code', 'sublime_text',
      'vlc', 'spotify', 'itunes',
      'calc', 'explorer', 'taskmgr', 'cmd', 'wt',
      'photoshop', 'mspaint', 'blender'
    ],
    timeout: 5000
  }
};

// Validation
function validateConfig() {
  const required = [
    'EMAIL_USER',
    'EMAIL_PASS',
    'CONTACT_SISTER',
    'CONTACT_FATHER'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
    console.warn('Please check your .env file');
  }

  return missing.length === 0;
}

// Get safe contact list (returns only configured contacts)
function getContacts() {
  const contacts = {};
  Object.entries(config.contacts).forEach(([key, value]) => {
    if (value && value !== 'example@email.com') {
      contacts[key] = value;
    }
  });
  return contacts;
}

module.exports = {
  config,
  validateConfig,
  getContacts
};
