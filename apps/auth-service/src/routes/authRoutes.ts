import { Router } from 'express';
import { register } from "../controllers/register";
import { verifyOtp } from "../controllers/verifyOtp";
import { login } from "../controllers/login";
import { refreshToken } from "../controllers/refreshToken";
import { getMe } from "../controllers/getMe";
import { testEmail } from "../controllers/testEmail";
import { authenticate } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';
import config from '../config/config';

const router: Router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later.' },
    timestamp: new Date().toISOString()
  }
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: { message: 'Too many attempts, please try again later.' },
    timestamp: new Date().toISOString()
  }
});

// Public routes
router.post('/register', strictLimiter, register);
router.post('/verify-otp', strictLimiter, verifyOtp);
router.post('/login', strictLimiter, login);

// Protected routes
router.get('/me', authLimiter, authenticate, getMe);
router.post('/refresh-token', authLimiter, authenticate, refreshToken);

// Test routes
if (config.server.nodeEnv === 'development') {
  router.post('/test-email', testEmail);
}

export default router;
