'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  attemptService, 
  questionService, 
  sessionService, 
  ruleService 
} from '@/services/api';
import { 
  QuizAttempt, 
  Question, 
  Session, 
  DiagnosticRule 
} from '@/types';
import AdminSessionAttempts from '@/components/admin/AdminSessionAttempts';

export default function SessionResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionKey = params.sessionKey as string;
  
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [diagnosticRules, setDiagnosticRules] = useState<DiagnosticRule[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/console/authorization');
          return;
        }

        const [ats, qs, ss, rules] = await Promise.all([
          attemptService.getAll(),
          questionService.getAll(),
          sessionService.getAll(),
          ruleService.getAll()
        ]);
        setAttempts(ats);
        setQuestions(qs);
        setSessions(ss);
        setDiagnosticRules(rules);
      } catch (err) {
        console.error('Failed to fetch session results data:', err);
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
        <p className="font-black text-[#016569] uppercase tracking-widest text-[10px]">Memuat Hasil Sesi...</p>
      </div>
    );
  }

  return (
    <AdminSessionAttempts 
      sessionKey={sessionKey} 
      attempts={attempts} 
      questions={questions} 
      sessions={sessions} 
      diagnosticRules={diagnosticRules} 
    />
  );
}
