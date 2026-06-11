import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { aiService } from '../services/ai.service';
import { teacherAgent } from '../agents';
import { prisma } from '../lib/prisma';

const router = Router();

router.use(authenticate);

router.post('/tutor/chat', authorize('STUDENT'), async (req: AuthRequest, res, next) => {
  try {
    const { message, subject } = z.object({
      message: z.string().min(1),
      subject: z.string().optional(),
    }).parse(req.body);

    const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } });
    if (!student) return res.status(404).json({ success: false, error: 'Student profile not found' });

    const response = await aiService.tutorChat(student.id, message, subject);
    res.json({ success: true, data: { response } });
  } catch (err) {
    next(err);
  }
});

router.post('/tutor/rag', authorize('STUDENT'), async (req: AuthRequest, res, next) => {
  try {
    const { query, subject, curriculum } = z.object({
      query: z.string().min(1),
      subject: z.string().optional(),
      curriculum: z.string().optional(),
    }).parse(req.body);

    const response = await aiService.ragQuery(query, subject, curriculum);
    res.json({ success: true, data: { response } });
  } catch (err) {
    next(err);
  }
});

router.post('/study-plan', authorize('STUDENT'), async (req: AuthRequest, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } });
    if (!student) return res.status(404).json({ success: false, error: 'Student profile not found' });

    const decisions = await aiService.generateStudyPlan(student.id);
    res.json({ success: true, data: decisions });
  } catch (err) {
    next(err);
  }
});

router.post('/mood-checkin', authorize('STUDENT'), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      moodLevel: z.enum(['VERY_LOW', 'LOW', 'NEUTRAL', 'GOOD', 'EXCELLENT']),
      stress: z.number().min(0).max(10),
      anxiety: z.number().min(0).max(10),
      energy: z.number().min(0).max(10),
      notes: z.string().optional(),
    }).parse(req.body);

    const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } });
    if (!student) return res.status(404).json({ success: false, error: 'Student profile not found' });

    const result = await aiService.analyzeMood(student.id, data);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/lesson-plan', authorize('TEACHER'), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      subject: z.string(),
      gradeLevel: z.string(),
      topic: z.string(),
      duration: z.number().min(15).max(180),
      curriculum: z.string().optional(),
    }).parse(req.body);

    const plan = await aiService.generateLessonPlan(data);
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

router.post('/quiz', authorize('TEACHER'), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      subject: z.string(),
      gradeLevel: z.string(),
      topic: z.string(),
      questionCount: z.number().min(1).max(20).default(5),
    }).parse(req.body);

    const quiz = await aiService.generateQuiz(data);
    res.json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
});

router.post('/risk-analysis/:studentId', authorize('TEACHER', 'ADMIN', 'COUNSELOR'), async (req, res, next) => {
  try {
    const decisions = await aiService.analyzeStudentRisk(req.params.studentId as string);
    res.json({ success: true, data: decisions });
  } catch (err) {
    next(err);
  }
});

router.post('/pipeline/:studentId', authorize('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const result = await aiService.runFullPipeline(req.params.studentId as string);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/parent-report/:studentId', authorize('PARENT'), async (req: AuthRequest, res, next) => {
  try {
    const parent = await prisma.parent.findUnique({ where: { userId: req.user!.userId } });
    if (!parent) return res.status(404).json({ success: false, error: 'Parent profile not found' });

    const report = await aiService.generateParentReport(parent.id, req.params.studentId as string);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

router.post('/career-guidance', authorize('STUDENT'), async (req: AuthRequest, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } });
    if (!student) return res.status(404).json({ success: false, error: 'Student profile not found' });

    const profile = await aiService.generateCareerGuidance(student.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

router.get('/recommendations/pending', authorize('TEACHER'), async (req: AuthRequest, res, next) => {
  try {
    const recommendations = await teacherAgent.getPendingRecommendations(req.user!.schoolId!);
    res.json({ success: true, data: recommendations });
  } catch (err) {
    next(err);
  }
});

router.post('/recommendations/:id/review', authorize('TEACHER'), async (req: AuthRequest, res, next) => {
  try {
    const { approved, reason } = z.object({
      approved: z.boolean(),
      reason: z.string().optional(),
    }).parse(req.body);

    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher profile not found' });

    const decision = await teacherAgent.approveRecommendation(
      req.params.id as string,
      teacher.id,
      approved,
      reason
    );
    res.json({ success: true, data: decision });
  } catch (err) {
    next(err);
  }
});

export default router;
