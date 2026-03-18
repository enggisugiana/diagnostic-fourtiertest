
export enum Role {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export interface AdminProfile {
  name: string;
  email: string;
  password: string;
}

export type CategoryType = 'pahamKonsep' | 'pahamSebagian' | 'miskonsepsi' | 'tidakPahamKonsep' | 'tidakDapatDikategorikan';

export interface DiagnosticRule {
  id: string; // key: t1c_t2s_t3c_t4s (c=correct, s=sure)
  t1Correct: boolean;
  t2Sure: boolean;
  t3Correct: boolean;
  t4Sure: boolean;
  category: CategoryType;
  awardPoint: boolean;
}

export interface SubjectModel {
  id: string;
  name: string;
  isActive: boolean;
  indicators?: IndicatorModel[];
}

export interface IndicatorModel {
  id: string;
  name: string;
  subjectId: string;
  subject?: SubjectModel;
  _count?: {
    questions: number;
  };
}

export interface Question {
  id: string;
  indicatorId: string;
  indicatorName?: string;
  subject?: string;
  subjectIsActive?: boolean;
  t1Text: string;
  t1Options: string[]; 
  t1Correct: number;
  t1Image?: string;
  t3Text: string;
  t3Options: string[]; 
  t3Correct: number;
}

export interface Session {
  id: string;
  key: string;
  name: string;
  school?: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  isActive: boolean;
  randomizeQuestions: boolean;
  createdAt: string | number;
}

export interface Student {
  absen: string;
  name: string;
  className: string;
}

export interface TierAnswer {
  questionId?: string;
  t1: number;
  t2: boolean | null;
  t3: number;
  t4: boolean | null;
}

export interface CategoryStats {
  pahamKonsep: number;
  pahamSebagian: number;
  miskonsepsi: number;
  tidakPahamKonsep: number;
  tidakDapatDikategorikan: number;
  total?: number;
}

export interface IndicatorResult {
  indicator: string;
  score: number;
  points: number;
  totalQuestions: number;
  stats: CategoryStats;
}

export interface SubjectResult {
  subject: string;
  score: number;
  points: number;
  totalQuestions: number;
  stats: CategoryStats;
  indicators: IndicatorResult[];
}

export interface QuizAttempt {
  id: string;
  studentNik: string;
  studentName?: string;
  studentClass?: string;
  score: number;
  points: number;
  totalQuestions: number;
  timestamp: string | number;
  durationUsedSeconds: number;
  subject: string;
  sessionKey: string;
  answers: TierAnswer[];
  stats: CategoryStats;
  subjectResults: SubjectResult[];
}
