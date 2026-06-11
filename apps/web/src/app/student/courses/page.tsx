'use client';

import { BookOpen, FileText, Video } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const courses = [
  { name: 'Mathematics', code: 'MATH-10', progress: 72, materials: 12, color: 'bg-brand-500' },
  { name: 'Integrated Science', code: 'SCI-10', progress: 65, materials: 8, color: 'bg-success-500' },
  { name: 'English', code: 'ENG-10', progress: 80, materials: 15, color: 'bg-amber-500' },
  { name: 'Kiswahili', code: 'KIS-10', progress: 88, materials: 10, color: 'bg-purple-500' },
];

export default function CoursesPage() {
  return (
    <ProtectedRoute roles={['STUDENT']}>
      <DashboardLayout title="My Courses">
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.code} className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${course.color} flex items-center justify-center`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{course.name}</h3>
                  <p className="text-xs text-gray-400">{course.code}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <div className={`h-2 rounded-full ${course.color}`} style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {course.materials} materials</span>
                    <span className="flex items-center gap-1"><Video className="w-3 h-3" /> 3 videos</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
