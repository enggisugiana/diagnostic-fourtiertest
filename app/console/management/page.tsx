'use client';

import React, { useState, useEffect } from 'react';
import { 
  questionService, 
  sessionService, 
  attemptService, 
  ruleService 
} from '@/services/api';
import { 
  Question, 
  Session, 
  QuizAttempt, 
  DiagnosticRule 
} from '@/types';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [diagnosticRules, setDiagnosticRules] = useState<DiagnosticRule[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/console/authorization');
          return;
        }

        const [qs, ss, ats, rules] = await Promise.all([
          questionService.getAll(),
          sessionService.getAll(),
          attemptService.getAll(),
          ruleService.getAll()
        ]);
        
        setQuestions(qs);
        setSessions(ss);
        setAttempts(ats);
        setDiagnosticRules(rules);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-10 w-10 border-4 border-[#016569] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-[#016569] uppercase tracking-widest text-[10px]">Memuat Dashboard...</p>
      </div>
    );
  }

  return (
    <AdminDashboard 
      attempts={attempts} 
      sessions={sessions} 
      questions={questions} 
      diagnosticRules={diagnosticRules} 
    />
  );
}
