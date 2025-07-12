import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import EmailService from "../services/emailService";
import { testEmailSchema } from '../validations/validationSchemas';
import { validateInput } from '../validations/validationHelper';

const { prisma } = DatabaseService;

export async function testEmail(req: Request, res: Response) {
  try {
    const validation = validateInput(testEmailSchema, req.body, res);
    if (!validation.success) return;
    
    const { email } = validation.data;

    // Test email connection first
    const connectionValid = await EmailService.testConnection();
    if (!connectionValid) {
      res.status(500).json({
        success: false,
        error: { message: 'Email service configuration error' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Send test email
    await EmailService.sendMail(
      email,
      'OnlyExams - Email Test',
      '<h2>Email service is working!</h2><p>Your OnlyExams email configuration is set up correctly.</p>'
    );

    res.status(200).json({
      success: true,
      data: { message: 'Test email sent successfully' },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to send test email' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}
