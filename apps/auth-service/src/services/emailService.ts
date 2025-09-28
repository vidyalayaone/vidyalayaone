import nodemailer from "nodemailer";
import config from "../config/config";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.ses.smtpHost, // change region if needed
      port: config.ses.smtpPort,
      secure: false, // true if using port 465
      auth: {
        user: config.ses.smtpUser, // from SES SMTP credentials
        pass: config.ses.smtpPass,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: config.ses.smtpFrom, // e.g. "noreply@yourdomain.com"
        to,
        subject,
        html,
      });

      console.log("✅ Email sent successfully:", info.messageId);
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      throw new Error("Failed to send email");
    }
  }

  async sendOTPEmail(email: string, otp: string): Promise<void> {
    const subject = "Vidyalayaone - Email Verification";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>OnlyExams Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in ${config.security.otpExpiresIn} minutes.</p>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }
}

export default new EmailService();
