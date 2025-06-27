import nodemailer from 'nodemailer';
import config from '../config/config';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html,
      });

      console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendOTPEmail(email: string, otp: string): Promise<void> {
    const subject = 'OnlyExams - Email Verification';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">OnlyExams Email Verification</h2>
        <p>Hello,</p>
        <p>Your verification code is:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in ${config.security.otpExpiresIn} minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from OnlyExams. Please do not reply.
        </p>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();
