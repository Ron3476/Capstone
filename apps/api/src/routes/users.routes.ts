import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize, auditLog, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string | undefined;

    const where = {
      schoolId: req.user!.schoolId,
      ...(role ? { role: role as never } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, isActive: true, lastLoginAt: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      firstName: z.string(),
      lastName: z.string(),
      role: z.enum(['STUDENT', 'TEACHER', 'PARENT', 'ADMIN', 'COUNSELOR']),
      phone: z.string().optional(),
    }).parse(req.body);

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        ...data,
        passwordHash,
        schoolId: req.user!.schoolId,
      },
    });

    await auditLog(req.user!.userId, req.user!.schoolId, 'CREATE', 'User', user.id, undefined, req);

    res.status(201).json({ success: true, data: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req: AuthRequest, res, next) => {
  try {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { isActive },
    });

    await auditLog(req.user!.userId, req.user!.schoolId, 'UPDATE', 'User', user.id, { isActive }, req);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

export default router;
