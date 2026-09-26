import { Request, Response } from 'express';
import { z } from 'zod';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { User, Role } from '../models/user.model';
import { env } from '../config/env';
import { s3Client } from '../config/s3';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middlewares/error.middleware';
import { createPendingUserAndSendActivation } from '../services/activation.service';

// GET /api/users - admin only: list all users
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(parseInt((req.query.page as string) ?? '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt((req.query.pageSize as string) ?? '20', 10), 1), 100);

  const { rows, count } = await User.findAndCountAll({
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  res.json({ users: rows.map((u) => u.toPublicJSON()), total: count, page, pageSize });
});

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email(),
  role: z.nativeEnum(Role).optional().default(Role.USER),
});

// POST /api/users - admin only: create a user (name + email). An
// activation email is sent so the new user sets their own password,
// same as self sign-up.
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, role } = createUserSchema.parse(req.body);

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const user = await createPendingUserAndSendActivation(name, email, role);
  res.status(201).json({ user: user.toPublicJSON() });
});

// GET /api/users/me - current user's own profile
export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByPk(req.user!.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user: user.toPublicJSON() });
});

// GET /api/users/:id - show a specific user's profile (admin, or self)
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (req.user!.role !== Role.ADMIN && req.user!.id !== id) {
    throw new ApiError(403, 'Forbidden: insufficient permissions');
  }

  const user = await User.findByPk(id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user: user.toPublicJSON() });
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

// PUT /api/users/me - update own name/email
export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = updateProfileSchema.parse(req.body);

  const user = await User.findByPk(req.user!.id);
  if (!user) throw new ApiError(404, 'User not found');

  if (data.email && data.email !== user.email) {
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) {
      throw new ApiError(409, 'Email already in use');
    }
    user.email = data.email;
  }

  if (data.name) user.name = data.name;

  await user.save();
  res.json({ user: user.toPublicJSON() });
});

// POST /api/users/me/avatar - upload/replace avatar image, stored in S3
export const uploadMyAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const user = await User.findByPk(req.user!.id);
  if (!user) throw new ApiError(404, 'User not found');

  const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
  const key = `avatars/${user.id}/${uuidv4()}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.aws.s3Bucket,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    })
  );

  user.avatarUrl = `https://${env.aws.s3Bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;
  await user.save();

  res.json({ user: user.toPublicJSON() });
});

// DELETE /api/users/:id - admin only: delete a user
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (req.user!.id === id) {
    throw new ApiError(400, 'Admins cannot delete their own account through this endpoint');
  }

  const user = await User.findByPk(id);
  if (!user) throw new ApiError(404, 'User not found');

  await user.destroy();
  res.json({ message: 'User deleted' });
});
