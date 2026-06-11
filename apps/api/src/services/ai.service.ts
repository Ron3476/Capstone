import { prisma } from '../lib/prisma';
import { jsonArray } from '../lib/json';
import { chatCompletion } from '../lib/openai';
import { tutorAgent, scoutAgent, guardianAgent, runAgentPipeline } from '../agents';

export class AIService {
  async tutorChat(studentId: string, message: string, subject?: string) {
    return tutorAgent.tutorChat(studentId, message, subject);
  }

  async generateStudyPlan(studentId: string) {
    return tutorAgent.generateStudyPlan(studentId);
  }

  async analyzeStudentRisk(studentId: string) {
    return scoutAgent.analyzeStudent(studentId);
  }

  async runFullPipeline(studentId: string) {
    return runAgentPipeline(studentId);
  }

  async analyzeMood(studentId: string, moodData: {
    moodLevel: string;
    stress: number;
    anxiety: number;
    energy: number;
    notes?: string;
  }) {
    const checkIn = await prisma.moodCheckIn.create({
      data: {
        studentId,
        moodLevel: moodData.moodLevel as never,
        stress: moodData.stress,
        anxiety: moodData.anxiety,
        energy: moodData.energy,
        notes: moodData.notes,
      },
    });

    const analysisPrompt = `Analyze this student mood check-in and provide brief JSON response:
Mood: ${moodData.moodLevel}, Stress: ${moodData.stress}/10, Anxiety: ${moodData.anxiety}/10, Energy: ${moodData.energy}/10
Notes: ${moodData.notes || 'None'}

Return JSON: { detectedIssues: string[], recommendations: string[], riskLevel: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL" }`;

    const analysisText = await chatCompletion(
      'You are a student wellbeing AI counselor. Respond only with valid JSON.',
      analysisPrompt,
      { temperature: 0.3 }
    );

    let analysis;
    try {
      analysis = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, ''));
    } catch {
      analysis = {
        detectedIssues: moodData.stress > 7 ? ['Elevated stress levels'] : [],
        recommendations: ['Take regular breaks', 'Talk to a trusted adult'],
        riskLevel: moodData.moodLevel === 'VERY_LOW' ? 'HIGH' : 'LOW',
      };
    }

    await prisma.moodCheckIn.update({
      where: { id: checkIn.id },
      data: { aiAnalysis: analysis },
    });

    await guardianAgent.reviewMoodCheckIn(checkIn.id);

    return { checkIn, analysis };
  }

  async generateLessonPlan(data: {
    subject: string;
    gradeLevel: string;
    topic: string;
    duration: number;
    curriculum?: string;
  }) {
    const prompt = `Create a detailed lesson plan for:
Subject: ${data.subject}
Grade: ${data.gradeLevel}
Topic: ${data.topic}
Duration: ${data.duration} minutes
Curriculum: ${data.curriculum || 'CBC (Kenya)'}

Return JSON: { title, objectives: string[], content: string (markdown), activities: string[] }`;

    const response = await chatCompletion(
      'You are an expert Kenyan curriculum lesson planner. Respond only with valid JSON.',
      prompt
    );

    try {
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch {
      return {
        title: data.topic,
        objectives: [`Understand ${data.topic}`],
        content: response,
        activities: ['Group discussion', 'Practice exercises'],
      };
    }
  }

  async generateQuiz(data: {
    subject: string;
    gradeLevel: string;
    topic: string;
    questionCount: number;
  }) {
    const prompt = `Generate ${data.questionCount} multiple-choice quiz questions for:
Subject: ${data.subject}, Grade: ${data.gradeLevel}, Topic: ${data.topic}
Curriculum: Kenyan CBC

Return JSON array: [{ question, options: string[4], correctIndex: number, explanation }]`;

    const response = await chatCompletion(
      'You are an expert quiz generator for Kenyan schools. Respond only with valid JSON array.',
      prompt
    );

    try {
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch {
      return [{ question: data.topic, options: ['A', 'B', 'C', 'D'], correctIndex: 0, explanation: 'Demo question' }];
    }
  }

  async generateParentReport(parentId: string, studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        attendance: { take: 30, orderBy: { date: 'desc' } },
        grades: { take: 10, orderBy: { gradedAt: 'desc' } },
        moodCheckIns: { take: 7, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!student) throw new Error('Student not found');

    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const prompt = `Generate a parent-friendly weekly progress report for ${student.user.firstName} ${student.user.lastName} (Grade ${student.gradeLevel}).
Include: academic progress summary, attendance patterns, areas needing support, recommended parent actions.
Keep language simple and encouraging. Return JSON: { summary: string, sections: { academics, attendance, wellbeing, recommendations } }`;

    const response = await chatCompletion(
      'You are Parent Intelligence AI for EduSavvy. Write in clear, warm language for African parents.',
      prompt
    );

    let content;
    try {
      content = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch {
      content = { summary: response, sections: {} };
    }

    const report = await prisma.parentReport.create({
      data: {
        parentId,
        studentId,
        weekStart,
        weekEnd,
        content,
        summary: content.summary || 'Weekly progress report',
        aiGenerated: true,
      },
    });

    return report;
  }

  async generateCareerGuidance(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, grades: true },
    });

    if (!student) throw new Error('Student not found');

    const avgGrade =
      student.grades.length > 0
        ? student.grades.reduce((s, g) => s + g.score / g.maxScore, 0) / student.grades.length
        : 0.7;

    const prompt = `Career guidance for Kenyan student:
Name: ${student.user.firstName}, Grade: ${student.gradeLevel}
Interests: ${jsonArray(student.interests).join(', ') || 'Undecided'}
Strengths: ${jsonArray(student.strengths).join(', ') || 'General'}
Career goals: ${jsonArray(student.careerGoals).join(', ') || 'Exploring'}
Academic performance: ${(avgGrade * 100).toFixed(0)}%

Return JSON: {
  recommendedCareers: [{ title, match, reason, requirements }],
  universities: [{ name, program, location, requirements }],
  tvetOpportunities: [{ institution, course, duration }],
  scholarships: [{ name, eligibility, deadline }],
  entrepreneurship: [{ idea, skills, market }]
}`;

    const response = await chatCompletion(
      'You are Career Guidance AI specializing in Kenyan and East African opportunities.',
      prompt
    );

    let guidance;
    try {
      guidance = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch {
      guidance = {
        recommendedCareers: [{ title: 'Software Developer', match: 85, reason: 'Strong analytical skills' }],
        universities: [{ name: 'University of Nairobi', program: 'Computer Science', location: 'Nairobi' }],
        tvetOpportunities: [],
        scholarships: [],
        entrepreneurship: [],
      };
    }

    const profile = await prisma.careerProfile.upsert({
      where: { studentId },
      create: {
        studentId,
        recommendedCareers: guidance.recommendedCareers,
        recommendedUniversities: guidance.universities,
        tvetOpportunities: guidance.tvetOpportunities,
        scholarships: guidance.scholarships,
        entrepreneurship: guidance.entrepreneurship,
      },
      update: {
        recommendedCareers: guidance.recommendedCareers,
        recommendedUniversities: guidance.universities,
        tvetOpportunities: guidance.tvetOpportunities,
        scholarships: guidance.scholarships,
        entrepreneurship: guidance.entrepreneurship,
        lastUpdated: new Date(),
      },
    });

    return profile;
  }

  async ragQuery(query: string, subject?: string, curriculum = 'CBC') {
    const documents = await prisma.knowledgeDocument.findMany({
      where: {
        OR: [
          { subject: subject || undefined },
          { curriculum },
        ],
      },
      take: 5,
    });

    const context = documents.map((d) => `[${d.title}]: ${d.content.slice(0, 500)}`).join('\n\n');

    const prompt = `Using the following curriculum knowledge base, answer the student's question.

Context:
${context || 'No specific documents found. Use general Kenyan curriculum knowledge.'}

Question: ${query}`;

    return chatCompletion(
      'You are EduSavvy RAG tutor with access to curriculum documents. Cite sources when possible.',
      prompt
    );
  }
}

export const aiService = new AIService();
