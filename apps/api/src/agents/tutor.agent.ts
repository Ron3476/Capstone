import { prisma } from '../lib/prisma';
import { jsonArray } from '../lib/json';
import { chatCompletion } from '../lib/openai';
import type { AgentDecision } from '@edu-savvy/shared';

export class TutorAgent {
  readonly agentType = 'TUTOR' as const;
  readonly authority = 'RECOMMEND_ONLY';

  async generateStudyPlan(studentId: string): Promise<AgentDecision[]> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        grades: { take: 10, orderBy: { gradedAt: 'desc' } },
        enrollments: { include: { class: { include: { classSubjects: { include: { subject: true } } } } } },
      },
    });

    if (!student) throw new Error('Student not found');

    const subjects = student.enrollments.flatMap((e: any) =>
      e.class.classSubjects.map((cs: any) => cs.subject.name)
    );

    const prompt = `Create a personalized weekly study plan for a Kenyan student (Grade ${student.gradeLevel}) studying ${student.user.firstName}.
Subjects: ${subjects.join(', ')}
Interests: ${jsonArray(student.interests).join(', ') || 'General'}
Recent performance context available.

Return JSON with: title, description, subjects (array), schedule (object with days), goals (array of strings).`;

    const response = await chatCompletion(
      'You are an expert Kenyan education tutor familiar with CBC curriculum. Respond only with valid JSON.',
      prompt,
      { temperature: 0.6 }
    );

    let planData;
    try {
      planData = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch {
      planData = {
        title: 'Personalized Study Plan',
        description: 'AI-generated weekly study schedule',
        subjects,
        schedule: { monday: 'Math & Science', tuesday: 'Languages', wednesday: 'Revision' },
        goals: ['Improve grades by 10%', 'Complete all assignments on time'],
      };
    }

    const plan = await prisma.studyPlan.create({
      data: {
        studentId,
        title: planData.title,
        description: planData.description,
        subjects: planData.subjects || subjects,
        schedule: planData.schedule,
        goals: planData.goals,
        aiGenerated: true,
      },
    });

    const recommendation = await prisma.aIRecommendation.create({
      data: {
        studentId,
        agentType: 'TUTOR',
        type: 'study_plan',
        title: plan.title,
        description: plan.description || 'Personalized study plan generated',
        priority: 'MEDIUM',
        status: 'PENDING',
        metadata: { planId: plan.id },
      },
    });

    return [
      {
        agent: 'TUTOR',
        action: 'RECOMMEND',
        payload: { recommendationId: recommendation.id, planId: plan.id },
        timestamp: new Date().toISOString(),
      },
    ];
  }

  async tutorChat(studentId: string, message: string, subject?: string): Promise<string> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    const systemPrompt = `You are EduSavvy AI Tutor, an expert educational assistant for African students.
Student: ${student?.user.firstName}, Grade: ${student?.gradeLevel}
Subject context: ${subject || 'General'}
Curriculum: Kenyan CBC (Competency Based Curriculum)

Guidelines:
- Explain concepts step-by-step in simple language
- Use local examples relevant to Kenya/East Africa
- Adapt explanations to the student's grade level
- Encourage and motivate the student
- Generate practice questions when appropriate`;

    const response = await chatCompletion(systemPrompt, message);

    await prisma.tutorSession.create({
      data: {
        studentId,
        subject,
        messages: [
          { role: 'user', content: message, timestamp: new Date().toISOString() },
          { role: 'assistant', content: response, timestamp: new Date().toISOString() },
        ],
      },
    });

    return response;
  }
}
