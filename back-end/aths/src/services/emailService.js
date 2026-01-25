import { transporter, getFromAddress } from '../config/email.js';

/**
 * Email Service
 * Handles sending various types of emails
 */

/**
 * Send email
 * @param {Object} options - Email options
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: getFromAddress(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${options.to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${options.to}:`, error.message);
    throw new Error('Failed to send email');
  }
};

/**
 * Send welcome email
 * @param {String} email - Recipient email
 * @param {String} fullName - User's full name
 */
export const sendWelcomeEmail = async (email, fullName) => {
  const subject = 'Welcome to R-MAN E-Commerce!';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to R-MAN E-Commerce!</h1>
          </div>
          <div class="content">
            <h2>Hello ${fullName},</h2>
            <p>Thank you for registering with R-MAN E-Commerce. We're excited to have you on board!</p>
            <p>Your account has been successfully created and you can now enjoy all our services.</p>
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The R-MAN E-Commerce Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 R-MAN Corporation, Bangalore. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Welcome to R-MAN E-Commerce!
    
    Hello ${fullName},
    
    Thank you for registering with R-MAN E-Commerce. We're excited to have you on board!
    
    Your account has been successfully created and you can now enjoy all our services.
    
    If you have any questions or need assistance, please don't hesitate to contact our support team.
    
    Best regards,
    The R-MAN E-Commerce Team
    
    © 2026 R-MAN Corporation, Bangalore. All rights reserved.
  `;

  await sendEmail({ to: email, subject, html, text });
};

/**
 * Send password reset email
 * @param {String} email - Recipient email
 * @param {String} fullName - User's full name
 * @param {String} resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (email, fullName, resetToken) => {
  const resetUrl = `${process.env.PASSWORD_RESET_URL}?token=${resetToken}`;
  const subject = 'Password Reset Request - R-MAN E-Commerce';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF5722; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 30px; background-color: #FF5722; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
          .token-box { background-color: #e9ecef; padding: 15px; border-radius: 5px; font-family: monospace; word-break: break-all; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${fullName},</h2>
            <p>We received a request to reset your password for your R-MAN E-Commerce account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <div class="token-box">${resetUrl}</div>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 5px 0;">
                <li>This link will expire in ${process.env.PASSWORD_RESET_TOKEN_EXPIRATION || '1 hour'}</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            <p>Best regards,<br>The R-MAN E-Commerce Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 R-MAN Corporation, Bangalore. All rights reserved.</p>
            <p>If you're having trouble clicking the button, copy and paste the URL into your web browser.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Password Reset Request - R-MAN E-Commerce
    
    Hello ${fullName},
    
    We received a request to reset your password for your R-MAN E-Commerce account.
    
    Click the link below to reset your password:
    ${resetUrl}
    
    ⚠️ Security Notice:
    - This link will expire in ${process.env.PASSWORD_RESET_TOKEN_EXPIRATION || '1 hour'}
    - If you didn't request this reset, please ignore this email
    - Never share this link with anyone
    
    Best regards,
    The R-MAN E-Commerce Team
    
    © 2026 R-MAN Corporation, Bangalore. All rights reserved.
  `;

  await sendEmail({ to: email, subject, html, text });
};

/**
 * Send password changed confirmation email
 * @param {String} email - Recipient email
 * @param {String} fullName - User's full name
 */
export const sendPasswordChangedEmail = async (email, fullName) => {
  const subject = 'Password Changed Successfully - R-MAN E-Commerce';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .success { background-color: #d4edda; border-left: 4px solid #28a745; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed Successfully</h1>
          </div>
          <div class="content">
            <h2>Hello ${fullName},</h2>
            <div class="success">
              <strong>✓ Your password has been changed successfully!</strong>
            </div>
            <p>This is a confirmation that your R-MAN E-Commerce account password was recently changed.</p>
            <p><strong>Changed on:</strong> ${new Date().toLocaleString()}</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The R-MAN E-Commerce Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 R-MAN Corporation, Bangalore. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Password Changed Successfully - R-MAN E-Commerce
    
    Hello ${fullName},
    
    ✓ Your password has been changed successfully!
    
    This is a confirmation that your R-MAN E-Commerce account password was recently changed.
    
    Changed on: ${new Date().toLocaleString()}
    
    If you did not make this change, please contact our support team immediately.
    
    Best regards,
    The R-MAN E-Commerce Team
    
    © 2026 R-MAN Corporation, Bangalore. All rights reserved.
  `;

  await sendEmail({ to: email, subject, html, text });
};

/**
 * Send email verification email
 * @param {String} email - Recipient email
 * @param {String} fullName - User's full name
 * @param {String} verificationToken - Email verification token
 */
export const sendEmailVerificationEmail = async (email, fullName, verificationToken) => {
  const verificationUrl = `${process.env.EMAIL_VERIFICATION_URL || 'http://localhost:3000/verify-email'}?token=${verificationToken}`;
  const subject = 'Verify Your Email - R-MAN E-Commerce';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .info { background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 10px; margin: 15px 0; }
          .token-box { background-color: #e9ecef; padding: 15px; border-radius: 5px; font-family: monospace; word-break: break-all; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <h2>Hello ${fullName},</h2>
            <p>Thank you for registering with R-MAN E-Commerce!</p>
            <p>Please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <div class="token-box">${verificationUrl}</div>
            <div class="info">
              <strong>ℹ️ Note:</strong>
              <ul style="margin: 5px 0;">
                <li>This link will expire in 24 hours</li>
                <li>If you didn't create an account, please ignore this email</li>
              </ul>
            </div>
            <p>Best regards,<br>The R-MAN E-Commerce Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 R-MAN Corporation, Bangalore. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Verify Your Email Address - R-MAN E-Commerce
    
    Hello ${fullName},
    
    Thank you for registering with R-MAN E-Commerce!
    
    Please verify your email address by clicking the link below:
    ${verificationUrl}
    
    ℹ️ Note:
    - This link will expire in 24 hours
    - If you didn't create an account, please ignore this email
    
    Best regards,
    The R-MAN E-Commerce Team
    
    © 2026 R-MAN Corporation, Bangalore. All rights reserved.
  `;

  await sendEmail({ to: email, subject, html, text });
};

export default {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendEmailVerificationEmail,
};
