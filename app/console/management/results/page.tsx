'use client';

import React, { useState, useEffect } from 'react';
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
import AdminResults from '@/components/admin/AdminResults';
import AdminSessionAttempts from '@/components/admin/AdminSessionAttempts';
import AdminResultDetail from '@/components/admin/AdminResultDetail';

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [diagnosticRules, setDiagnosticRules] = useState<DiagnosticRule[]>([]);

  // Sub-view management within results
  const [currentSubView, setCurrentSubView] = useState('list');
  const [viewParams, setViewParams] = useState<any>({});

  const fetchData = async () => {
    try {
      setLoading(true);
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
      console.error('Failed to fetch results data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNavigate = (view: string, params: any = {}) => {
    if (view === 'results') {
      setCurrentSubView('list');
    } else {
      setCurrentSubView(view);
      setViewParams(params);
    }
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-10 w-10 border-4 border-[#016569] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-[#016569] uppercase tracking-widest text-[10px]">Memuat Hasil...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {currentSubView === 'list' && (
        <AdminResults 
          attempts={attempts} 
          questions={questions} 
          sessions={sessions} 
          diagnosticRules={diagnosticRules} 
          onNavigate={handleNavigate} 
        />
      )}
      {currentSubView === 'result-session' && (
        <AdminSessionAttempts 
          sessionKey={viewParams.sessionKey} 
          attempts={attempts} 
          questions={questions} 
          sessions={sessions} 
          diagnosticRules={diagnosticRules} 
          onNavigate={handleNavigate} 
        />
      )}
      {currentSubView === 'result-detail' && (
        <AdminResultDetail 
          attemptId={viewParams.attemptId} 
          attempts={attempts} 
          questions={questions} 
          diagnosticRules={diagnosticRules} 
          onNavigate={handleNavigate} 
        />
      )}
    </div>
  );
}
