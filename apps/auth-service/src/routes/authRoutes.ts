import { Router } from 'express';
import { register } from '../controllers/register';
import { resendOtp } from '../controllers/resendOtp';
import { verifyOtpForRegistration } from '../controllers/verifyOtpForRegistration';
import { verifyOtpForPasswordReset } from '../controllers/verifyOtpForPasswordReset';
import rateLimit from 'express-rate-limit';

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


router.post('/register', strictLimiter, register);
router.post('/resend-otp', strictLimiter, resendOtp);
router.post('/verify-otp/registration', strictLimiter, verifyOtpForRegistration);
router.post('/verify-otp/password-reset', strictLimiter, verifyOtpForPasswordReset);


// import { login } from "../controllers/login";
// import { refreshToken } from "../controllers/refreshToken";
// import { getMe } from "../controllers/getMe";
// import { addTenantToAdmin } from "../controllers/addTenantToAdmin";
// import { testEmail } from "../controllers/testEmail";
// import { authenticate } from '../middleware/authMiddleware';

// router.post('/login', strictLimiter, login);
// router.get('/me', authLimiter, authenticate, getMe);
// router.post('/refresh-token', authLimiter, authenticate, refreshToken);

//Internal routes
// router.post('/add-tenant-to-admin', addTenantToAdmin)

export default router;
