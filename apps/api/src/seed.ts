import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding EduSavvy AI database...');

  const school = await prisma.school.upsert({
    where: { code: 'EDU-NBO-001' },
    update: {},
    create: {
      name: 'Nairobi Academy of Excellence',
      code: 'EDU-NBO-001',
      address: '123 Education Lane, Westlands',
      county: 'Nairobi',
      country: 'Kenya',
      phone: '+254712345678',
      email: 'admin@nairobiacademy.edu.ke',
      curriculum: 'CBC',
    },
  });

  const passwordHash = await bcrypt.hash('Password123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@edusavvy.ai' },
    update: {},
    create: {
      email: 'admin@edusavvy.ai',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Wanjiku',
      role: 'ADMIN',
      schoolId: school.id,
      emailVerified: true,
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@edusavvy.ai' },
    update: {},
    create: {
      email: 'teacher@edusavvy.ai',
      passwordHash,
      firstName: 'James',
      lastName: 'Ochieng',
      role: 'TEACHER',
      schoolId: school.id,
      emailVerified: true,
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      employeeId: 'TCH-001',
      department: 'Sciences',
      qualifications: 'B.Ed Science, University of Nairobi',
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@edusavvy.ai' },
    update: {},
    create: {
      email: 'student@edusavvy.ai',
      passwordHash,
      firstName: 'Amina',
      lastName: 'Kamau',
      role: 'STUDENT',
      schoolId: school.id,
      emailVerified: true,
    },
  });

  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      admissionNumber: 'STU-2024-001',
      gradeLevel: 'Grade 10',
      dateOfBirth: new Date('2009-03-15'),
      interests: ['Mathematics', 'Technology', 'Music'],
      strengths: ['Problem solving', 'Creativity', 'Leadership'],
      careerGoals: ['Software Engineer', 'Entrepreneur'],
    },
  });

  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@edusavvy.ai' },
    update: {},
    create: {
      email: 'parent@edusavvy.ai',
      passwordHash,
      firstName: 'David',
      lastName: 'Kamau',
      role: 'PARENT',
      schoolId: school.id,
      emailVerified: true,
    },
  });

  const parent = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
      occupation: 'Business Owner',
    },
  });

  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId: parent.id, studentId: student.id } },
    update: {},
    create: { parentId: parent.id, studentId: student.id, relation: 'father' },
  });

  const counselorUser = await prisma.user.upsert({
    where: { email: 'counselor@edusavvy.ai' },
    update: {},
    create: {
      email: 'counselor@edusavvy.ai',
      passwordHash,
      firstName: 'Grace',
      lastName: 'Muthoni',
      role: 'COUNSELOR',
      schoolId: school.id,
      emailVerified: true,
    },
  });

  await prisma.counselor.upsert({
    where: { userId: counselorUser.id },
    update: {},
    create: {
      userId: counselorUser.id,
      licenseNo: 'COUN-KE-2020-045',
    },
  });

  const class10A = await prisma.class.upsert({
    where: { schoolId_name_academicYear: { schoolId: school.id, name: '10A', academicYear: '2025/2026' } },
    update: {},
    create: {
      schoolId: school.id,
      name: '10A',
      gradeLevel: 'Grade 10',
      academicYear: '2025/2026',
      room: 'Block B - Room 12',
    },
  });

  const mathSubject = await prisma.subject.upsert({
    where: { schoolId_code: { schoolId: school.id, code: 'MATH-10' } },
    update: {},
    create: {
      schoolId: school.id,
      name: 'Mathematics',
      code: 'MATH-10',
      description: 'Grade 10 Mathematics - CBC Curriculum',
      curriculum: 'CBC',
    },
  });

  const scienceSubject = await prisma.subject.upsert({
    where: { schoolId_code: { schoolId: school.id, code: 'SCI-10' } },
    update: {},
    create: {
      schoolId: school.id,
      name: 'Integrated Science',
      code: 'SCI-10',
      description: 'Grade 10 Integrated Science',
      curriculum: 'CBC',
    },
  });

  const mathClassSubject = await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: class10A.id, subjectId: mathSubject.id } },
    update: {},
    create: { classId: class10A.id, subjectId: mathSubject.id, teacherId: teacher.id },
  });

  await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: class10A.id, subjectId: scienceSubject.id } },
    update: {},
    create: { classId: class10A.id, subjectId: scienceSubject.id, teacherId: teacher.id },
  });

  await prisma.enrollment.upsert({
    where: { studentId_classId: { studentId: student.id, classId: class10A.id } },
    update: {},
    create: { studentId: student.id, classId: class10A.id },
  });

  const assignment = await prisma.assignment.create({
    data: {
      classSubjectId: mathClassSubject.id,
      teacherId: teacher.id,
      title: 'Algebra Problem Set - Chapter 5',
      description: 'Complete exercises 1-20 on quadratic equations',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      status: 'PUBLISHED',
    },
  });

  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment.id,
      studentId: student.id,
      status: 'PENDING',
    },
  });

  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    await prisma.attendance.create({
      data: {
        studentId: student.id,
        classId: class10A.id,
        date,
        status: i === 3 ? 'ABSENT' : i === 7 ? 'LATE' : 'PRESENT',
      },
    });
  }

  const moods = ['GOOD', 'NEUTRAL', 'GOOD', 'LOW', 'EXCELLENT', 'GOOD', 'NEUTRAL'] as const;
  for (let i = 0; i < moods.length; i++) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - i);
    await prisma.moodCheckIn.create({
      data: {
        studentId: student.id,
        moodLevel: moods[i],
        stress: Math.floor(Math.random() * 6) + 2,
        anxiety: Math.floor(Math.random() * 5) + 1,
        energy: Math.floor(Math.random() * 4) + 5,
        createdAt,
      },
    });
  }

  await prisma.knowledgeDocument.createMany({
    data: [
      {
        schoolId: school.id,
        title: 'CBC Mathematics Grade 10 - Algebra',
        content: 'Quadratic equations are polynomial equations of degree 2. The general form is ax² + bx + c = 0. Methods of solving include factoring, completing the square, and using the quadratic formula.',
        subject: 'Mathematics',
        curriculum: 'CBC',
      },
      {
        schoolId: school.id,
        title: 'CBC Science Grade 10 - Photosynthesis',
        content: 'Photosynthesis is the process by which green plants convert light energy into chemical energy. The equation is: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. This process occurs in chloroplasts.',
        subject: 'Integrated Science',
        curriculum: 'CBC',
      },
    ],
  });

  console.log('✅ Seed completed!');
  console.log('\nDemo accounts (password: Password123!):');
  console.log('  Admin:    admin@edusavvy.ai');
  console.log('  Teacher:  teacher@edusavvy.ai');
  console.log('  Student:  student@edusavvy.ai');
  console.log('  Parent:   parent@edusavvy.ai');
  console.log('  Counselor: counselor@edusavvy.ai');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
