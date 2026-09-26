import { Router } from 'express';
import {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getActivation,
  activateAccount,
  resendActivation,
  googleAuth,
} from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleAuth);

router.get('/activate/:token', getActivation);
router.post('/activate/:token', activateAccount);
router.post('/resend-activation', resendActivation);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
