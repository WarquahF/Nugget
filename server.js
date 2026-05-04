// J.A.R.V.I.S Backend Server
// Handles secure operations and sensitive data

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const nodemailer = require('nodemailer');

const { config, validateConfig, getContacts } = require('./config');

const app = express();
const PORT = config.app.port;

// Middleware
app.use(cors());
app.use(express.json());

// Validate configuration on startup
if (!validateConfig()) {
  console.error('Server configuration incomplete. Please check your .env file.');
  process.exit(1);
}

// Email transporter
let emailTransporter;
try {
  emailTransporter = nodemailer.createTransporter({
    service: config.email.service,
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });
  console.log('Email service configured successfully');
} catch (error) {
  console.error('Failed to configure email service:', error.message);
}

// API Routes

// Get secure contacts (instead of storing in frontend)
app.get('/api/contacts', (req, res) => {
  try {
    const contacts = getContacts();
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send email (secure backend implementation)
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    // Validate inputs
    if (!to || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, message' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email address format' 
      });
    }

    // Sanitize message content
    const sanitizedMessage = message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
      .substring(0, 1000);

    const mailOptions = {
      from: config.email.from,
      to,
      subject: subject.substring(0, 100), // Limit subject length
      text: sanitizedMessage,
      html: `<p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>`
    };

    const result = await emailTransporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', result.messageId);
    res.json({ 
      success: true, 
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Launch application (secure backend implementation)
app.post('/api/launch-app', async (req, res) => {
  try {
    const { executable, appName } = req.body;

    // Validate inputs
    if (!executable || !appName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: executable, appName' 
      });
    }

    // Check if app is allowed
    if (!config.launcher.allowedApps.includes(executable.toLowerCase())) {
      return res.status(403).json({ 
        success: false, 
        error: `Application "${executable}" is not authorized for launch` 
      });
    }

    console.log(`Launching application: ${appName} (${executable})`);

    // Platform-specific launching
    const platform = process.platform;
    let launchCommand;

    switch (platform) {
      case 'win32':
        launchCommand = `start "" "${executable}"`;
        break;
      case 'darwin':
        // For macOS, we need to map executable names to app names
        const macAppMap = {
          'chrome': 'Google Chrome',
          'firefox': 'Firefox',
          'discord': 'Discord',
          'slack': 'Slack',
          'code': 'Visual Studio Code',
          'vlc': 'VLC'
        };
        const macAppName = macAppMap[executable] || executable;
        launchCommand = `open -a "${macAppName}"`;
        break;
      case 'linux':
        launchCommand = executable;
        break;
      default:
        return res.status(500).json({ 
          success: false, 
          error: `Unsupported platform: ${platform}` 
        });
    }

    // Execute launch command
    const child = spawn(launchCommand, [], {
      stdio: 'ignore',
      detached: true,
      shell: true
    });

    child.unref();

    // Set timeout
    const timeout = setTimeout(() => {
      child.kill();
      res.status(500).json({ 
        success: false, 
        error: 'Application launch timeout' 
      });
    }, config.launcher.timeout);

    child.on('error', (error) => {
      clearTimeout(timeout);
      res.status(500).json({ 
        success: false, 
        error: `Failed to execute command: ${error.message}` 
      });
    });

    child.on('spawn', () => {
      clearTimeout(timeout);
      console.log(`Application ${appName} launched successfully`);
      res.json({ 
        success: true, 
        appName,
        executable,
        platform,
        timestamp: new Date().toISOString()
      });
    });

  } catch (error) {
    console.error('App launch error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get available applications
app.get('/api/available-apps', (req, res) => {
  try {
    res.json({ 
      success: true, 
      apps: config.launcher.allowedApps 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`J.A.R.V.I.S Backend Server running on port ${PORT}`);
  console.log(`Environment: ${config.app.env}`);
  console.log(`Email service: ${emailTransporter ? 'Configured' : 'Not configured'}`);
});

module.exports = app;
