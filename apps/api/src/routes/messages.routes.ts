import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: req.user!.userId }, { receiverId: req.user!.userId }],
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      receiverId: z.string(),
      subject: z.string().optional(),
      body: z.string().min(1),
    }).parse(req.body);

    const message = await prisma.message.create({
      data: {
        senderId: req.user!.userId,
        ...data,
      },
      include: {
        sender: { select: { firstName: true, lastName: true } },
        receiver: { select: { firstName: true, lastName: true } },
      },
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', async (req: AuthRequest, res, next) => {
  try {
    const message = await prisma.message.update({
      where: { id: req.params.id as string, receiverId: req.user!.userId },
      data: { isRead: true },
    });

    res.json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
});

export default router;
