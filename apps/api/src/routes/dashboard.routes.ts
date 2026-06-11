import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { dashboardService } from '../services/dashboard.service';
import { prisma } from '../lib/prisma';

const router = Router();

router.use(authenticate);

router.get('/admin', authorize('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const stats = await dashboardService.getAdminStats(req.user!.schoolId!);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

router.get('/student', authorize('STUDENT'), async (req: AuthRequest, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } });
    if (!student) return res.status(404).json({ success: false, error: 'Student profile not found' });

    const data = await dashboardService.getStudentDashboard(student.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/teacher', authorize('TEACHER'), async (req: AuthRequest, res, next) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher profile not found' });

    const data = await dashboardService.getTeacherDashboard(teacher.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/parent', authorize('PARENT'), async (req: AuthRequest, res, next) => {
  try {
    const parent = await prisma.parent.findUnique({ where: { userId: req.user!.userId } });
    if (!parent) return res.status(404).json({ success: false, error: 'Parent profile not found' });

    const data = await dashboardService.getParentDashboard(parent.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/counselor', authorize('COUNSELOR'), async (req: AuthRequest, res, next) => {
  try {
    const data = await dashboardService.getCounselorDashboard(req.user!.schoolId!);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
