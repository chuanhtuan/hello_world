import { Router } from 'express';
import { Role } from '../models/user.model';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { avatarUpload } from '../middlewares/upload.middleware';
import {
  listUsers,
  getMyProfile,
  getUserById,
  updateMyProfile,
  uploadMyAvatar,
  deleteUser,
} from '../controllers/user.controller';

const router = Router();

router.use(authenticate);

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);
router.post('/me/avatar', avatarUpload.single('avatar'), uploadMyAvatar);

router.get('/', requireRole(Role.ADMIN), listUsers);
router.get('/:id', getUserById);
router.delete('/:id', requireRole(Role.ADMIN), deleteUser);

export default router;
