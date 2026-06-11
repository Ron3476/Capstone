import { prisma } from '../lib/prisma';
import type { AgentDecision } from '@edu-savvy/shared';

export class TeacherAgent {
  readonly agentType = 'TEACHER' as const;
  readonly authority = 'APPROVE_OR_REJECT';

  async approveRecommendation(
    recommendationId: string,
    teacherId: string,
    approved: boolean,
    reason?: string
  ): Promise<AgentDecision> {
    const recommendation = await prisma.aIRecommendation.update({
      where: { id: recommendationId },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        approvedById: teacherId,
        approvedAt: new Date(),
        rejectedReason: approved ? null : reason,
      },
    });

    return {
      agent: 'TEACHER',
      action: approved ? 'APPROVE' : 'REJECT',
      payload: {
        recommendationId,
        teacherId,
        reason,
        type: recommendation.type,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getPendingRecommendations(schoolId: string) {
    return prisma.aIRecommendation.findMany({
      where: {
        status: 'PENDING',
        student: {
          user: { schoolId },
        },
      },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }
}
