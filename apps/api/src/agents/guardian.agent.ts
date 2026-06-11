import { prisma } from '../lib/prisma';
import type { AgentDecision } from '@edu-savvy/shared';

export class GuardianAgent {
  readonly agentType = 'GUARDIAN' as const;
  readonly authority = 'PAUSE_RECOMMENDATIONS';

  private readonly ethicalKeywords = [
    'self-harm', 'suicide', 'abuse', 'violence', 'discrimination',
    'exploitation', 'harassment', 'bullying',
  ];

  async reviewRecommendation(recommendationId: string): Promise<AgentDecision[]> {
    const recommendation = await prisma.aIRecommendation.findUnique({
      where: { id: recommendationId },
      include: { student: { include: { user: true } } },
    });

    if (!recommendation) throw new Error('Recommendation not found');

    const decisions: AgentDecision[] = [];
    const contentToReview = `${recommendation.title} ${recommendation.description}`.toLowerCase();

    const ethicalConcern = this.ethicalKeywords.some((kw) => contentToReview.includes(kw));
    const studentAge = recommendation.student.dateOfBirth
      ? this.calculateAge(recommendation.student.dateOfBirth)
      : 15;

    if (ethicalConcern || studentAge < 13) {
      await prisma.aIRecommendation.update({
        where: { id: recommendationId },
        data: { status: 'PAUSED', pausedByGuardian: true },
      });

      decisions.push({
        agent: 'GUARDIAN',
        action: 'PAUSE',
        payload: {
          recommendationId,
          reason: ethicalConcern
            ? 'Ethical concern detected in recommendation content'
            : 'Student age requires additional safeguarding review',
        },
        timestamp: new Date().toISOString(),
      });
    }

    return decisions;
  }

  async reviewMoodCheckIn(moodCheckInId: string): Promise<AgentDecision[]> {
    const checkIn = await prisma.moodCheckIn.findUnique({
      where: { id: moodCheckInId },
      include: { student: true },
    });

    if (!checkIn) throw new Error('Mood check-in not found');

    const decisions: AgentDecision[] = [];
    const highRisk =
      checkIn.moodLevel === 'VERY_LOW' ||
      checkIn.stress >= 8 ||
      checkIn.anxiety >= 8 ||
      (checkIn.notes && this.ethicalKeywords.some((kw) => checkIn.notes!.toLowerCase().includes(kw)));

    if (highRisk) {
      const alert = await prisma.wellbeingAlert.create({
        data: {
          moodCheckInId,
          riskLevel: checkIn.moodLevel === 'VERY_LOW' ? 'CRITICAL' : 'HIGH',
          concern: 'Guardian Agent escalated wellbeing concern',
          recommendation: 'Immediate counselor review recommended',
        },
      });

      decisions.push({
        agent: 'GUARDIAN',
        action: 'FLAG',
        payload: { alertId: alert.id, moodCheckInId, escalated: true },
        timestamp: new Date().toISOString(),
      });
    }

    return decisions;
  }

  private calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }
}
