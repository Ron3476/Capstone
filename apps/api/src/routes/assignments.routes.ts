import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } });
      if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

      const submissions = await prisma.assignmentSubmission.findMany({
        where: { studentId: student.id },
        include: { assignment: { include: { classSubject: { include: { subject: true } } } }, grade: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, data: submissions });
    }

    if (req.user!.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } });
      if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

      const assignments = await prisma.assignment.findMany({
        where: { teacherId: teacher.id },
        include: { classSubject: { include: { subject: true, class: true } }, submissions: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, data: assignments });
    }

    res.status(403).json({ success: false, error: 'Unauthorized' });
  } catch (err) {
    next(err);
  }
});

router.post('/', authorize('TEACHER'), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      classSubjectId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      dueDate: z.string().datetime(),
      maxScore: z.number().default(100),
      aiGenerated: z.boolean().default(false),
    }).parse(req.body);

    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.userId } });
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

    const assignment = await prisma.assignment.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
        teacherId: teacher.id,
        status: 'PUBLISHED',
      },
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/submit', authorize('STUDENT'), async (req: AuthRequest, res, next) => {
  try {
    const { content, fileUrl } = z.object({
      content: z.string().optional(),
      fileUrl: z.string().optional(),
    }).parse(req.body);

    const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: req.params.id,
          studentId: student.id,
        },
      },
      create: {
        assignmentId: req.params.id,
        studentId: student.id,
        content,
        fileUrl,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      update: {
        content,
        fileUrl,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
});

router.post('/submissions/:id/grade', authorize('TEACHER'), async (req: AuthRequest, res, next) => {
  try {
    const { score, feedback } = z.object({
      score: z.number().min(0),
      feedback: z.string().optional(),
    }).parse(req.body);

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: req.params.id },
      include: { assignment: true },
    });

    if (!submission) return res.status(404).json({ success: false, error: 'Submission not found' });

    const grade = await prisma.grade.upsert({
      where: { submissionId: submission.id },
      create: {
        submissionId: submission.id,
        studentId: submission.studentId,
        score,
        maxScore: submission.assignment.maxScore,
        feedback,
        gradedBy: req.user!.userId,
      },
      update: { score, feedback, gradedBy: req.user!.userId, gradedAt: new Date() },
    });

    await prisma.assignmentSubmission.update({
      where: { id: submission.id },
      data: { status: 'GRADED' },
    });

    res.json({ success: true, data: grade });
  } catch (err) {
    next(err);
  }
});

export default router;
