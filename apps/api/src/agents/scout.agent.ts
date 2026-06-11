import { prisma } from '../lib/prisma';
import type { AgentDecision } from '@edu-savvy/shared';

interface StudentMetrics {
  studentId: string;
  attendanceRate: number;
  averageGrade: number;
  assignmentCompletion: number;
  recentMoodAvg: number;
}

export class ScoutAgent {
  readonly agentType = 'SCOUT' as const;
  readonly authority = 'FLAG_ONLY';

  async analyzeStudent(studentId: string): Promise<AgentDecision[]> {
    const metrics = await this.gatherMetrics(studentId);
    const decisions: AgentDecision[] = [];

    const failureRisk = this.calculateFailureRisk(metrics);
    const dropoutRisk = this.calculateDropoutRisk(metrics);
    const riskLevel = this.determineRiskLevel(failureRisk, dropoutRisk);

    await prisma.riskAssessment.create({
      data: {
        studentId,
        failureRisk,
        dropoutRisk,
        learningGaps: this.identifyLearningGaps(metrics),
        factors: metrics as never,
        riskLevel,
        agentType: 'SCOUT',
      },
    });

    if (riskLevel !== 'LOW') {
      decisions.push({
        agent: 'SCOUT',
        action: 'FLAG',
        payload: {
          studentId,
          riskLevel,
          failureRisk,
          dropoutRisk,
          message: `Student flagged with ${riskLevel} risk level`,
        },
        timestamp: new Date().toISOString(),
      });

      await prisma.aIRecommendation.create({
        data: {
          studentId,
          agentType: 'SCOUT',
          type: 'risk_alert',
          title: `${riskLevel} Risk Alert`,
          description: `Scout Agent detected elevated risk. Failure: ${(failureRisk * 100).toFixed(0)}%, Dropout: ${(dropoutRisk * 100).toFixed(0)}%`,
          priority: riskLevel,
          status: 'PENDING',
          metadata: { failureRisk, dropoutRisk, metrics },
        },
      });
    }

    return decisions;
  }

  private async gatherMetrics(studentId: string): Promise<StudentMetrics> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [attendance, grades, submissions, moods] = await Promise.all([
      prisma.attendance.findMany({ where: { studentId, date: { gte: thirtyDaysAgo } } }),
      prisma.grade.findMany({ where: { studentId } }),
      prisma.assignmentSubmission.findMany({ where: { studentId } }),
      prisma.moodCheckIn.findMany({ where: { studentId, createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
    const attendanceRate = attendance.length > 0 ? presentCount / attendance.length : 1;

    const averageGrade =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + g.score / g.maxScore, 0) / grades.length
        : 0.7;

    const completedSubmissions = submissions.filter((s) => s.status !== 'PENDING').length;
    const assignmentCompletion =
      submissions.length > 0 ? completedSubmissions / submissions.length : 1;

    const moodMap = { VERY_LOW: 1, LOW: 2, NEUTRAL: 3, GOOD: 4, EXCELLENT: 5 };
    const recentMoodAvg =
      moods.length > 0
        ? moods.reduce((sum, m) => sum + moodMap[m.moodLevel], 0) / moods.length
        : 3;

    return { studentId, attendanceRate, averageGrade, assignmentCompletion, recentMoodAvg };
  }

  private calculateFailureRisk(m: StudentMetrics): number {
    return Math.min(
      1,
      (1 - m.averageGrade) * 0.4 +
        (1 - m.assignmentCompletion) * 0.35 +
        (1 - m.attendanceRate) * 0.25
    );
  }

  private calculateDropoutRisk(m: StudentMetrics): number {
    return Math.min(
      1,
      (1 - m.attendanceRate) * 0.45 +
        (m.recentMoodAvg < 2.5 ? 0.35 : 0) +
        (1 - m.assignmentCompletion) * 0.2
    );
  }

  private determineRiskLevel(failure: number, dropout: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const max = Math.max(failure, dropout);
    if (max >= 0.75) return 'CRITICAL';
    if (max >= 0.5) return 'HIGH';
    if (max >= 0.3) return 'MEDIUM';
    return 'LOW';
  }

  private identifyLearningGaps(m: StudentMetrics): string[] {
    const gaps: string[] = [];
    if (m.averageGrade < 0.5) gaps.push('Academic performance below threshold');
    if (m.assignmentCompletion < 0.6) gaps.push('Low assignment completion rate');
    if (m.attendanceRate < 0.8) gaps.push('Attendance concerns');
    if (m.recentMoodAvg < 2.5) gaps.push('Well-being indicators declining');
    return gaps;
  }
}
