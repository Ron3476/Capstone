export type UserRole = 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN' | 'COUNSELOR';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AgentType = 'SCOUT' | 'TUTOR' | 'GUARDIAN' | 'TEACHER';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  schoolId?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  attendanceRate: number;
  averageGrade: number;
  atRiskStudents: number;
  pendingAssignments: number;
}

export interface AgentDecision {
  agent: AgentType;
  action: 'FLAG' | 'RECOMMEND' | 'PAUSE' | 'APPROVE' | 'REJECT';
  payload: Record<string, unknown>;
  timestamp: string;
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  STUDENT: '/student',
  TEACHER: '/teacher',
  PARENT: '/parent',
  ADMIN: '/admin',
  COUNSELOR: '/counselor',
};

export const CURRICULA = ['CBC', 'IGCSE', 'KCSE', 'IB'] as const;

export const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Kiambu', 'Machakos', 'Kajiado', 'Nyeri', 'Kakamega',
] as const;
