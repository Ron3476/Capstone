import { ScoutAgent } from './scout.agent';
import { TutorAgent } from './tutor.agent';
import { GuardianAgent } from './guardian.agent';
import { TeacherAgent } from './teacher.agent';

export const scoutAgent = new ScoutAgent();
export const tutorAgent = new TutorAgent();
export const guardianAgent = new GuardianAgent();
export const teacherAgent = new TeacherAgent();

export async function runAgentPipeline(studentId: string) {
  const scoutDecisions = await scoutAgent.analyzeStudent(studentId);

  const pendingRecs = await import('../lib/prisma').then(({ prisma }) =>
    prisma.aIRecommendation.findMany({
      where: { studentId, status: 'PENDING' },
    })
  );

  const guardianDecisions = [];
  for (const rec of pendingRecs) {
    const decisions = await guardianAgent.reviewRecommendation(rec.id);
    guardianDecisions.push(...decisions);
  }

  return {
    scout: scoutDecisions,
    guardian: guardianDecisions,
    pipeline: 'Scout → Guardian → (awaiting Teacher approval)',
  };
}
