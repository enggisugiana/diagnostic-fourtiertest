import axios from 'axios';
import { Question, Session, Student, QuizAttempt, AdminProfile, DiagnosticRule } from '../types';

const api = axios.create({
  baseURL: '/api',
});

// Add auth header
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('auth_token');
  },
  updateProfile: async (data: any) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  }
};

export const subjectService = {
  getAll: () => api.get('/subjects'),
  create: (data: { name: string }) => api.post('/subjects', data),
  update: (id: string, data: { name: string, isActive?: boolean }) => api.put(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`)
};

export const indicatorService = {
  getBySubject: (subjectId: string) => api.get(`/indicators/subject/${subjectId}`),
  create: (data: { name: string, subjectId: string }) => api.post('/indicators', data),
  update: (id: string, data: { name: string }) => api.put(`/indicators/${id}`, data),
  delete: (id: string) => api.delete(`/indicators/${id}`)
};

export const questionService = {
  getAll: async () => {
    const response = await api.get<Question[]>('/questions');
    return response.data;
  },
  create: async (data: Omit<Question, 'id'>) => {
    const response = await api.post<Question>('/questions', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Question>) => {
    const response = await api.put<Question>(`/questions/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  }
};

export const sessionService = {
  getAll: async () => {
    const response = await api.get<Session[]>('/sessions');
    return response.data;
  },
  create: async (data: Omit<Session, 'id' | 'isActive' | 'createdAt'>) => {
    const response = await api.post<Session>('/sessions', data);
    return response.data;
  },
  toggle: async (id: string) => {
    const response = await api.patch<Session>(`/sessions/${id}`, {});
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  }
};

export const attemptService = {
  getAll: async () => {
    const response = await api.get<QuizAttempt[]>('/attempts');
    return response.data;
  },
  checkStatus: async (studentNik: string, sessionKey: string) => {
    const response = await api.get<QuizAttempt[]>(`/attempts?studentNik=${studentNik}&sessionKey=${sessionKey}`);
    return response.data;
  },
  submit: async (data: any) => {
    const response = await api.post<QuizAttempt>('/attempts', data);
    return response.data;
  }
};

export const ruleService = {
  getAll: async () => {
    const response = await api.get<DiagnosticRule[]>('/rules');
    return response.data;
  },
  updateAll: async (rules: DiagnosticRule[]) => {
    const response = await api.put('/rules', rules);
    return response.data;
  }
};
