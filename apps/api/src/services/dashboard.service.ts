import { prisma } from '../lib/prisma';
import type { DashboardStats } from '@edu-savvy/shared';

export class DashboardService {
  async getAdminStats(schoolId: string): Promise<DashboardStats & Record<string, unknown>> {
    const [students, teachers, attendance, grades, atRisk, pendingAssignments] = await Promise.all([
      prisma.student.count({ where: { user: { schoolId } } }),
      prisma.teacher.count({ where: { user: { schoolId } } }),
      prisma.attendance.findMany({
        where: { class: { schoolId } },
        take: 500,
        orderBy: { date: 'desc' },
      }),
      prisma.grade.findMany({
        where: { student: { user: { schoolId } } },
        take: 500,
      }),
      prisma.riskAssessment.count({
        where: {
          riskLevel: { in: ['HIGH', 'CRITICAL'] },
          student: { user: { schoolId } },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.assignmentSubmission.count({
        where: {
          status: 'PENDING',
          student: { user: { schoolId } },
        },
      }),
    ]);

    const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
    const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 95;

    const averageGrade =
      grades.length > 0
        ? (grades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / grades.length)
        : 72;

    return {
      totalStudents: students,
      totalTeachers: teachers,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      averageGrade: Math.round(averageGrade * 10) / 10,
      atRiskStudents: atRisk,
      pendingAssignments,
    };
  }

  async getStudentDashboard(studentId: string) {
    const [grades, submissions, attendance, studyPlans, moodCheckIns, careerProfile] =
      await Promise.all([
        prisma.grade.findMany({ where: { studentId }, orderBy: { gradedAt: 'desc' }, take: 10 }),
        prisma.assignmentSubmission.findMany({
          where: { studentId },
          include: { assignment: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.attendance.findMany({ where: { studentId }, orderBy: { date: 'desc' }, take: 30 }),
        prisma.studyPlan.findMany({ where: { studentId, isActive: true } }),
        prisma.moodCheckIn.findMany({ where: { studentId }, orderBy: { createdAt: 'desc' }, take: 7 }),
        prisma.careerProfile.findUnique({ where: { studentId } }),
      ]);

    const avgScore =
      grades.length > 0
        ? grades.reduce((s, g) => s + g.score / g.maxScore, 0) / grades.length
        : 0;

    const presentDays = attendance.filter((a) => a.status === 'PRESENT').length;
    const attendanceRate = attendance.length > 0 ? presentDays / attendance.length : 1;

    const pendingAssignments = submissions.filter((s) => s.status === 'PENDING').length;

    return {
      averageScore: Math.round(avgScore * 100),
      attendanceRate: Math.round(attendanceRate * 100),
      pendingAssignments,
      recentGrades: grades,
      upcomingAssignments: submissions.filter((s) => s.status === 'PENDING'),
      studyPlans,
      moodTrend: moodCheckIns,
      careerProfile,
    };
  }

  async getTeacherDashboard(teacherId: string) {
    const classSubjects = await prisma.classSubject.findMany({
      where: { teacherId },
      include: {
        class: { include: { enrollments: { include: { student: { include: { user: true } } } } } },
        subject: true,
        assignments: { include: { submissions: true } },
      },
    });

    const totalStudents = new Set(
      classSubjects.flatMap((cs) => cs.class.enrollments.map((e) => e.studentId))
    ).size;

    const pendingGrading = classSubjects.reduce(
      (sum, cs) =>
        sum +
        cs.assignments.reduce(
          (a, asn) => a + asn.submissions.filter((s) => s.status === 'SUBMITTED').length,
          0
        ),
      0
    );

    const alerts = await prisma.aIRecommendation.findMany({
      where: {
        status: 'PENDING',
        student: {
          enrollments: {
            some: {
              class: {
                classSubjects: { some: { teacherId } },
              },
            },
          },
        },
      },
      include: { student: { include: { user: true } } },
      take: 10,
    });

    return { classSubjects, totalStudents, pendingGrading, alerts };
  }

  async getParentDashboard(parentId: string) {
    const children = await prisma.parentStudent.findMany({
      where: { parentId },
      include: {
        student: {
          include: {
            user: true,
            grades: { take: 5, orderBy: { gradedAt: 'desc' } },
            attendance: { take: 30, orderBy: { date: 'desc' } },
            moodCheckIns: { take: 5, orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });

    const reports = await prisma.parentReport.findMany({
      where: { parentId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return { children, reports };
  }

  async getCounselorDashboard(schoolId: string) {
    const alerts = await prisma.wellbeingAlert.findMany({
      where: {
        isResolved: false,
        moodCheckIn: { student: { user: { schoolId } } },
      },
      include: {
        moodCheckIn: {
          include: { student: { include: { user: true } } },
        },
      },
      orderBy: [{ riskLevel: 'desc' }, { createdAt: 'desc' }],
    });

    const recentCheckIns = await prisma.moodCheckIn.findMany({
      where: { student: { user: { schoolId } } },
      include: { student: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return { alerts, recentCheckIns, unresolvedCount: alerts.length };
  }
}

export const dashboardService = new DashboardService();
