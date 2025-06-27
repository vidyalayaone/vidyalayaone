import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';
import config from '../config/config';

const router: Router = Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later.' },
    timestamp: new Date().toISOString()
  }
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for sensitive operations
  message: {
    success: false,
    error: { message: 'Too many attempts, please try again later.' },
    timestamp: new Date().toISOString()
  }
});

// Public routes
router.post('/register', strictLimiter, authController.register);
router.post('/verify-otp', strictLimiter, authController.verifyOtp);
router.post('/login', strictLimiter, authController.login);
router.post('/refresh-token', authLimiter, authController.refreshToken);

// Protected routes
router.get('/me', authLimiter, authController.getMe);
router.post('/logout', authLimiter, authController.logout);

// Add this route for testing (remove in production)
if (config.server.nodeEnv === 'development') {
  router.post('/test-email', authController.testEmail);
}

export default router;
