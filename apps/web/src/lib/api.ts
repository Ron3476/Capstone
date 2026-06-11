import type { ApiResponse, UserRole } from '@edu-savvy/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new Error(
      'Cannot reach the API server. From the project root run: npm run setup && npm run dev'
    );
  }

  let data: ApiResponse<T>;
  try {
    data = await res.json();
  } catch {
    throw new Error(`API error (${res.status}). Make sure the API is running on ${API_URL}`);
  }

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: Record<string, unknown>; accessToken: string; refreshToken: string }>(
        '/api/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    me: () => request<Record<string, unknown>>('/api/auth/me'),
    logout: (refreshToken: string) =>
      request('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  },

  dashboard: {
    admin: () => request<Record<string, unknown>>('/api/dashboard/admin'),
    student: () => request<Record<string, unknown>>('/api/dashboard/student'),
    teacher: () => request<Record<string, unknown>>('/api/dashboard/teacher'),
    parent: () => request<Record<string, unknown>>('/api/dashboard/parent'),
    counselor: () => request<Record<string, unknown>>('/api/dashboard/counselor'),
  },

  ai: {
    tutorChat: (message: string, subject?: string) =>
      request<{ response: string }>('/api/ai/tutor/chat', {
        method: 'POST',
        body: JSON.stringify({ message, subject }),
      }),
    moodCheckIn: (data: {
      moodLevel: string;
      stress: number;
      anxiety: number;
      energy: number;
      notes?: string;
    }) =>
      request('/api/ai/mood-checkin', { method: 'POST', body: JSON.stringify(data) }),
    studyPlan: () => request('/api/ai/study-plan', { method: 'POST' }),
    careerGuidance: () => request('/api/ai/career-guidance', { method: 'POST' }),
    lessonPlan: (data: Record<string, unknown>) =>
      request('/api/ai/lesson-plan', { method: 'POST', body: JSON.stringify(data) }),
    quiz: (data: Record<string, unknown>) =>
      request('/api/ai/quiz', { method: 'POST', body: JSON.stringify(data) }),
    pendingRecommendations: () => request<unknown[]>('/api/ai/recommendations/pending'),
    reviewRecommendation: (id: string, approved: boolean, reason?: string) =>
      request(`/api/ai/recommendations/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ approved, reason }),
      }),
    parentReport: (studentId: string) =>
      request(`/api/ai/parent-report/${studentId}`, { method: 'POST' }),
  },

  assignments: {
    list: () => request<unknown[]>('/api/assignments'),
    create: (data: Record<string, unknown>) =>
      request('/api/assignments', { method: 'POST', body: JSON.stringify(data) }),
    submit: (id: string, data: { content?: string; fileUrl?: string }) =>
      request(`/api/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
    grade: (submissionId: string, score: number, feedback?: string) =>
      request(`/api/assignments/submissions/${submissionId}/grade`, {
        method: 'POST',
        body: JSON.stringify({ score, feedback }),
      }),
  },

  messages: {
    list: () => request<unknown[]>('/api/messages'),
    send: (data: { receiverId: string; subject?: string; body: string }) =>
      request('/api/messages', { method: 'POST', body: JSON.stringify(data) }),
  },

  users: {
    list: (params?: { page?: number; role?: UserRole }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.role) query.set('role', params.role);
      return request<unknown[]>(`/api/users?${query}`);
    },
  },
};
