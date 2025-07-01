import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import DatabaseService from '../services/database'; // Import database service
import { createAndSendOTP, verifyOTP } from '../services/otpService';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import config from '../config/config';
import EmailService from "../services/emailService";

const { prisma } = DatabaseService;

export async function register(req: Request, res: Response) {
  const { email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: 'Email already registered' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, config.security.bcryptSaltRounds);
  await prisma.user.create({
    data: { email, password: hashedPassword, isVerified: false },
  });

  await createAndSendOTP(email);
  res.status(201).json({ message: 'Registration successful. Please verify your email.' });
  return;
}

export async function verifyOtp(req: Request, res: Response) {
  const { email, otp } = req.body;
  const valid = await verifyOTP(email, otp);
  if (!valid) {
    res.status(400).json({ message: 'Invalid or expired OTP' });
    return;
  }

  await prisma.user.update({ where: { email }, data: { isVerified: true } });
  res.json({ message: 'Email verified successfully.' });
  return;
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isVerified) {
    res.status(401).json({ message: 'Invalid credentials or unverified email' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const accessToken = generateAccessToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
  });

  res.json({ accessToken, refreshToken });
  return;
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    const user = req.user as any;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: { message: 'Refresh token is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Delete the specific refresh token
    await prisma.refreshToken.deleteMany({ 
      where: { 
        token: refreshToken,
        userId: user.id 
      } 
    });

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Logout failed' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}

export async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;
  try {
    const payload = verifyRefreshToken(refreshToken) as any;
    const tokenRecord = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!tokenRecord) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const accessToken = generateAccessToken({ userId: payload.userId });
    const newRefreshToken = generateRefreshToken({ userId: payload.userId });

    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
    return;
  } catch {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
    return;
  }
}

// export async function getMe(req: Request, res: Response) {
//   try {
//     // req.user is set by the authenticate middleware
//     const user = req.user as any;
//
//     res.status(200).json({
//       success: true,
//       data: {
//         id: user.id,
//         email: user.email,
//         isVerified: user.isVerified,
//         createdAt: user.createdAt
//       },
//       timestamp: new Date().toISOString()
//     });
//     return;
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: { message: 'Failed to get user information' },
//       timestamp: new Date().toISOString()
//     });
//     return;
//   }
// }

export async function getMe(req: Request, res: Response) {
  try {
    // Get user info from gateway-provided header
    // const userInfo = req.headers['x-user-data'];
    const userId = req.user?.id;

    console.log(req.user);
    
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Unauthenticated' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // const user = JSON.parse(userInfo as string);
    
    // Optionally fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, isVerified: true, createdAt: true }
    });

    res.status(200).json({
      success: true,
      user,
      timestamp: new Date().toISOString()
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user information' },
      timestamp: new Date().toISOString()
    });
    return;
  }
}

export async function testEmail(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: { message: 'Email is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

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
