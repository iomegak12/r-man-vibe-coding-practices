import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Configuration
 * Configures Nodemailer for sending emails via Gmail
 */

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Get email from address
 */
export const getFromAddress = () => {
  const fromName = process.env.EMAIL_FROM_NAME || 'R-MAN E-Commerce';
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  return `"${fromName}" <${fromEmail}>`;
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service verification failed:', error.message);
    return false;
  }
};

export const transporter = createTransporter();

export default {
  transporter,
  getFromAddress,
  verifyEmailConfig,
};
