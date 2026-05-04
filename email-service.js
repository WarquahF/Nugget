// Secure Email Service for J.A.R.V.I.S Assistant
// This file should be used with the Electron backend

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure email transporter (use your preferred email service)
    this.transporter = nodemailer.createTransporter({
      service: 'gmail', // or any other email service
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Configure this
        pass: process.env.EMAIL_PASS || 'your-app-password'      // Configure this
      }
    });
  }

  async sendEmail(options) {
    try {
      console.log('Preparing email transmission...', options);
      
      // Validate email address
      if (!this.isValidEmail(options.to)) {
        throw new Error('Invalid recipient email address');
      }

      // Sanitize content
      const sanitizedSubject = this.sanitizeText(options.subject);
      const sanitizedMessage = this.sanitizeText(options.message);

      const mailOptions = {
        from: options.from || 'J.A.R.V.I.S <jarvis@assistant.com>',
        to: options.to,
        subject: sanitizedSubject,
        text: sanitizedMessage,
        html: `<p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>`
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('Email transmitted successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Email transmission failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  sanitizeText(text) {
    if (typeof text !== 'string') return '';
    
    // Remove potentially harmful content
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
      .substring(0, 1000); // Limit length
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified');
      return { success: true };
    } catch (error) {
      console.error('Email service connection failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export for use in Electron main process
module.exports = EmailService;

// Example usage in Electron main process:
/*
const EmailService = require('./email-service');
const emailService = new EmailService();

// Add this to your Electron IPC handlers:
ipcMain.handle('send-email', async (event, options) => {
  return await emailService.sendEmail(options);
});
*/
