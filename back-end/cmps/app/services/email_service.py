"""
Email Service
Handles sending complaint-related email notifications
"""
from app.config.email import send_email
import logging

logger = logging.getLogger(__name__)


def send_complaint_created_email(customer_email: str, customer_name: str, complaint_id: str, subject: str, category: str):
    """
    Send complaint registration confirmation email to customer
    
    Args:
        customer_email: Customer email address
        customer_name: Customer full name
        complaint_id: Complaint ID
        subject: Complaint subject
        category: Complaint category
    """
    email_subject = f"Complaint Registered: {complaint_id} - R-MAN E-Commerce"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
          .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
          .header {{ background-color: #FF9800; color: white; padding: 20px; text-align: center; }}
          .content {{ padding: 20px; background-color: #f9f9f9; }}
          .complaint-box {{ background-color: #fff; border-left: 4px solid #FF9800; padding: 15px; margin: 15px 0; }}
          .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
          .info {{ background-color: #e3f2fd; padding: 10px; margin: 15px 0; border-radius: 4px; }}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Complaint Registered Successfully</h1>
          </div>
          <div class="content">
            <h2>Hello {customer_name},</h2>
            <p>Thank you for reaching out to us. We have successfully registered your complaint and our team will review it shortly.</p>
            
            <div class="complaint-box">
              <p><strong>Complaint ID:</strong> {complaint_id}</p>
              <p><strong>Category:</strong> {category}</p>
              <p><strong>Subject:</strong> {subject}</p>
              <p><strong>Status:</strong> Open</p>
            </div>
            
            <div class="info">
              <strong>ℹ️ What happens next?</strong>
              <ul style="margin: 5px 0;">
                <li>Our team will review your complaint within 24 hours</li>
                <li>You'll receive updates via email when status changes</li>
                <li>You can add comments to provide more information</li>
                <li>Track your complaint status anytime through your account</li>
              </ul>
            </div>
            
            <p>You can reference this complaint using ID: <strong>{complaint_id}</strong></p>
            
            <p>We appreciate your patience and will work to resolve your concern as quickly as possible.</p>
            
            <p>Best regards,<br>The R-MAN Customer Support Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 R-MAN Corporation, Bangalore. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
    </html>
    """
    
    text_body = f"""
    Complaint Registered Successfully - R-MAN E-Commerce
    
    Hello {customer_name},
    
    Thank you for reaching out to us. We have successfully registered your complaint.
    
    Complaint Details:
    - Complaint ID: {complaint_id}
    - Category: {category}
    - Subject: {subject}
    - Status: Open
    
    What happens next?
    - Our team will review your complaint within 24 hours
    - You'll receive updates via email when status changes
    - You can add comments to provide more information
    - Track your complaint status anytime through your account
    
    Reference: {complaint_id}
    
    Best regards,
    The R-MAN Customer Support Team
    
    © 2026 R-MAN Corporation, Bangalore. All rights reserved.
    """
    
    send_email(customer_email, email_subject, html_body, text_body)


def send_complaint_status_changed_email(customer_email: str, customer_name: str, complaint_id: str, 
                                       old_status: str, new_status: str, subject: str):
    """
    Send email notification when complaint status changes
    
    Args:
        customer_email: Customer email address
        customer_name: Customer full name
        complaint_id: Complaint ID
        old_status: Previous status
        new_status: New status
        subject: Complaint subject
    """
    email_subject = f"Status Update: {complaint_id} - R-MAN E-Commerce"
    
    # Status-specific messages
    status_messages = {
        "In Progress": "Our team is actively working on your complaint.",
        "Resolved": "Your complaint has been resolved! Please review the resolution details.",
        "Closed": "Your complaint has been closed. Thank you for your patience.",
        "Reopened": "Your complaint has been reopened and will be reviewed again.",
    }
    
    status_message = status_messages.get(new_status, "Your complaint status has been updated.")
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
          .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
          .header {{ background-color: #2196F3; color: white; padding: 20px; text-align: center; }}
          .content {{ padding: 20px; background-color: #f9f9f9; }}
          .status-box {{ background-color: #fff; border-left: 4px solid #2196F3; padding: 15px; margin: 15px 0; }}
          .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
          .highlight {{ background-color: #e8f5e9; padding: 10px; margin: 15px 0; border-radius: 4px; }}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Complaint Status Update</h1>
          </div>
          <div class="content">
            <h2>Hello {customer_name},</h2>
            <p>{status_message}</p>
            
            <div class="status-box">
              <p><strong>Complaint ID:</strong> {complaint_id}</p>
              <p><strong>Subject:</strong> {subject}</p>
              <p><strong>Previous Status:</strong> {old_status}</p>
              <p><strong>New Status:</strong> <span style="color: #2196F3; font-weight: bold;">{new_status}</span></p>
            </div>
            
            <p>You can view complete details and add comments by logging into your account.</p>
            
            <p>Best regards,<br>The R-MAN Customer Support Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 R-MAN Corporation, Bangalore. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    """
    
    text_body = f"""
    Complaint Status Update - R-MAN E-Commerce
    
    Hello {customer_name},
    
    {status_message}
    
    Complaint Details:
    - Complaint ID: {complaint_id}
    - Subject: {subject}
    - Previous Status: {old_status}
    - New Status: {new_status}
    
    You can view complete details and add comments by logging into your account.
    
    Best regards,
    The R-MAN Customer Support Team
    
    © 2026 R-MAN Corporation, Bangalore. All rights reserved.
    """
    
    send_email(customer_email, email_subject, html_body, text_body)


def send_complaint_resolved_email(customer_email: str, customer_name: str, complaint_id: str, 
                                  subject: str, resolution_notes: str, resolved_by_name: str):
    """
    Send email notification when complaint is resolved
    
    Args:
        customer_email: Customer email address
        customer_name: Customer full name
        complaint_id: Complaint ID
        subject: Complaint subject
        resolution_notes: Resolution details
        resolved_by_name: Name of admin who resolved
    """
    email_subject = f"Complaint Resolved: {complaint_id} - R-MAN E-Commerce"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
          .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
          .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; }}
          .content {{ padding: 20px; background-color: #f9f9f9; }}
          .resolution-box {{ background-color: #fff; border-left: 4px solid #4CAF50; padding: 15px; margin: 15px 0; }}
          .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
          .success {{ background-color: #e8f5e9; padding: 10px; margin: 15px 0; border-radius: 4px; }}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Complaint Resolved</h1>
          </div>
          <div class="content">
            <h2>Hello {customer_name},</h2>
            
            <div class="success">
              <p><strong>Good news!</strong> Your complaint has been resolved.</p>
            </div>
            
            <div class="resolution-box">
              <p><strong>Complaint ID:</strong> {complaint_id}</p>
              <p><strong>Subject:</strong> {subject}</p>
              <p><strong>Resolved By:</strong> {resolved_by_name}</p>
              <p><strong>Resolution:</strong></p>
              <p style="white-space: pre-wrap;">{resolution_notes}</p>
            </div>
            
            <p><strong>Not satisfied with the resolution?</strong></p>
            <p>If you're not satisfied with the resolution, you can reopen this complaint within a reasonable timeframe by logging into your account.</p>
            
            <p>Thank you for your patience and for giving us the opportunity to resolve your concern.</p>
            
            <p>Best regards,<br>The R-MAN Customer Support Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 R-MAN Corporation, Bangalore. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    """
    
    text_body = f"""
    Complaint Resolved - R-MAN E-Commerce
    
    Hello {customer_name},
    
    Good news! Your complaint has been resolved.
    
    Complaint Details:
    - Complaint ID: {complaint_id}
    - Subject: {subject}
    - Resolved By: {resolved_by_name}
    
    Resolution:
    {resolution_notes}
    
    Not satisfied with the resolution?
    If you're not satisfied with the resolution, you can reopen this complaint by logging into your account.
    
    Thank you for your patience and for giving us the opportunity to resolve your concern.
    
    Best regards,
    The R-MAN Customer Support Team
    
    © 2026 R-MAN Corporation, Bangalore. All rights reserved.
    """
    
    send_email(customer_email, email_subject, html_body, text_body)


def send_complaint_assigned_email(customer_email: str, customer_name: str, complaint_id: str, 
                                 subject: str, assigned_to_name: str):
    """
    Send email notification when complaint is assigned to an admin
    
    Args:
        customer_email: Customer email address
        customer_name: Customer full name
        complaint_id: Complaint ID
        subject: Complaint subject
        assigned_to_name: Name of admin assigned
    """
    email_subject = f"Complaint Update: {complaint_id} - R-MAN E-Commerce"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
          .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
          .header {{ background-color: #9C27B0; color: white; padding: 20px; text-align: center; }}
          .content {{ padding: 20px; background-color: #f9f9f9; }}
          .info-box {{ background-color: #fff; border-left: 4px solid #9C27B0; padding: 15px; margin: 15px 0; }}
          .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Complaint Assigned</h1>
          </div>
          <div class="content">
            <h2>Hello {customer_name},</h2>
            <p>Your complaint has been assigned to a specialist for review.</p>
            
            <div class="info-box">
              <p><strong>Complaint ID:</strong> {complaint_id}</p>
              <p><strong>Subject:</strong> {subject}</p>
              <p><strong>Assigned To:</strong> {assigned_to_name}</p>
              <p><strong>Status:</strong> In Progress</p>
            </div>
            
            <p>Our specialist will review your complaint and work towards a resolution. You'll receive updates as progress is made.</p>
            
            <p>Best regards,<br>The R-MAN Customer Support Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 R-MAN Corporation, Bangalore. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    """
    
    text_body = f"""
    Complaint Assigned - R-MAN E-Commerce
    
    Hello {customer_name},
    
    Your complaint has been assigned to a specialist for review.
    
    Complaint Details:
    - Complaint ID: {complaint_id}
    - Subject: {subject}
    - Assigned To: {assigned_to_name}
    - Status: In Progress
    
    Our specialist will review your complaint and work towards a resolution.
    
    Best regards,
    The R-MAN Customer Support Team
    
    © 2026 R-MAN Corporation, Bangalore. All rights reserved.
    """
    
    send_email(customer_email, email_subject, html_body, text_body)


def send_complaint_comment_email(customer_email: str, customer_name: str, complaint_id: str, 
                                subject: str, commenter_name: str, comment: str):
    """
    Send email notification when a new comment is added to complaint
    
    Args:
        customer_email: Customer email address
        customer_name: Customer full name
        complaint_id: Complaint ID
        subject: Complaint subject
        commenter_name: Name of person who added comment
        comment: Comment text
    """
    email_subject = f"New Comment: {complaint_id} - R-MAN E-Commerce"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
          .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
          .header {{ background-color: #00BCD4; color: white; padding: 20px; text-align: center; }}
          .content {{ padding: 20px; background-color: #f9f9f9; }}
          .comment-box {{ background-color: #fff; border-left: 4px solid #00BCD4; padding: 15px; margin: 15px 0; }}
          .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Comment Added</h1>
          </div>
          <div class="content">
            <h2>Hello {customer_name},</h2>
            <p>A new comment has been added to your complaint.</p>
            
            <div class="comment-box">
              <p><strong>Complaint ID:</strong> {complaint_id}</p>
              <p><strong>Subject:</strong> {subject}</p>
              <p><strong>Comment By:</strong> {commenter_name}</p>
              <p><strong>Comment:</strong></p>
              <p style="white-space: pre-wrap;">{comment}</p>
            </div>
            
            <p>You can view all comments and reply by logging into your account.</p>
            
            <p>Best regards,<br>The R-MAN Customer Support Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 R-MAN Corporation, Bangalore. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    """
    
    text_body = f"""
    New Comment Added - R-MAN E-Commerce
    
    Hello {customer_name},
    
    A new comment has been added to your complaint.
    
    Complaint Details:
    - Complaint ID: {complaint_id}
    - Subject: {subject}
    - Comment By: {commenter_name}
    
    Comment:
    {comment}
    
    You can view all comments and reply by logging into your account.
    
    Best regards,
    The R-MAN Customer Support Team
    
    © 2026 R-MAN Corporation, Bangalore. All rights reserved.
    """
    
    send_email(customer_email, email_subject, html_body, text_body)
