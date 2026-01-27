"""
Email Configuration
Configures SMTP for sending emails
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config.settings import settings
import logging

logger = logging.getLogger(__name__)


def send_email(to_email: str, subject: str, html_body: str, text_body: str = None):
    """
    Send email via SMTP
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_body: HTML email body
        text_body: Plain text email body (optional)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add text part if provided
        if text_body:
            msg.attach(MIMEText(text_body, 'plain'))
        
        # Add HTML part
        msg.attach(MIMEText(html_body, 'html'))
        
        # Connect to SMTP server
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls()
            server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"📧 Email sent successfully to {to_email}: {subject}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to send email to {to_email}: {str(e)}")
        return False


def verify_email_config():
    """
    Verify email configuration by testing SMTP connection
    
    Returns:
        bool: True if configuration is valid, False otherwise
    """
    try:
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=5) as server:
            server.starttls()
            server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
        
        logger.info("✅ Email service configuration verified")
        return True
        
    except Exception as e:
        logger.warning(f"⚠️  Email service verification failed: {str(e)}")
        logger.warning("Email notifications will be disabled")
        return False
