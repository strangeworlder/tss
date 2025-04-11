import { EventEmitter } from 'node:events';
import ErrorHandler, { ErrorCategory, ErrorSeverity } from './ErrorHandler';
import MonitoringService from './MonitoringService';
import { IUser } from '../domains/users/models/user.model';
import User from '../domains/users/models/user.model';

// Email template interface
export interface IEmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email options interface
export interface IEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Singleton class
export class EmailService extends EventEmitter {
  private static instance: EmailService;
  private errorHandler: typeof ErrorHandler;
  private monitoringService: typeof MonitoringService;
  private fromEmail: string;
  private isConfigured = false;

  private constructor() {
    super();
    this.errorHandler = ErrorHandler;
    this.monitoringService = MonitoringService;
    this.fromEmail = process.env.EMAIL_FROM || 'notifications@theslowapp.com';

    // Check if email service is configured
    this.isConfigured = this.checkEmailConfiguration();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Check if email service is configured
  private checkEmailConfiguration(): boolean {
    // In a real implementation, this would check for SendGrid or AWS SES credentials
    // For now, we'll just check if the environment variables are set
    const hasSendGridApiKey = !!process.env.SENDGRID_API_KEY;
    const hasAwsAccessKey = !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY;

    return hasSendGridApiKey || hasAwsAccessKey;
  }

  // Send an email
  public async sendEmail(options: IEmailOptions): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        this.errorHandler.handleError(new Error('Email service is not configured'), {
          message: 'Email service is not configured',
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.NETWORK,
          timestamp: new Date(),
          context: { options },
        });
        console.log(`[EMAIL SIMULATION] Sending email to ${options.to}: ${options.subject}`);
        return true; // Return true for simulation purposes
      }

      // TODO: Implement actual email sending using a service like SendGrid or AWS SES
      console.log('Sending email:', options);

      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 100));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: 'Failed to send email',
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.NETWORK,
        timestamp: new Date(),
        context: { options },
      });
      return false;
    }
  }

  // Get user email by ID
  public async getUserEmail(userId: string): Promise<string | null> {
    try {
      // TODO: Implement actual user email lookup
      return 'user@example.com';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.errorHandler.handleError(new Error(errorMessage), {
        message: 'Failed to get user email',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.DATABASE,
        timestamp: new Date(),
        context: { userId },
      });
      return null;
    }
  }

  // Generate email template for notification
  public generateNotificationTemplate(
    title: string,
    message: string,
    actionUrl?: string
  ): IEmailTemplate {
    const subject = title;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-radius: 5px;
            }
            .content {
              padding: 20px;
            }
            .button {
              display: inline-block;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 5px;
              margin-top: 20px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #6c757d;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <p>${message}</p>
            ${actionUrl ? `<a href="${actionUrl}" class="button">View Details</a>` : ''}
          </div>
          <div class="footer">
            <p>This is an automated message from The Slow App. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `;

    const text = `${title}\n\n${message}\n\n${actionUrl ? `View details: ${actionUrl}` : ''}\n\nThis is an automated message from The Slow App. Please do not reply to this email.`;

    return { subject, html, text };
  }
}
