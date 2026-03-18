'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question, QuizAttempt, Student, Session, DiagnosticRule } from '@/types';
import StudentPortal from '@/components/student/StudentPortal';
import StudentLogin from '@/components/student/StudentLogin';
import StudentProfileForm from '@/components/student/StudentProfileForm';
import QuizInstructions from '@/components/student/QuizInstructions';
import { questionService, sessionService, attemptService, ruleService } from '@/services/api';

export default function Home() {
  const router = useRouter();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [diagnosticRules, setDiagnosticRules] = useState<DiagnosticRule[]>([]);
  
  const [activeSessionKey, setActiveSessionKey] = useState<string | null>(null);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [hasReadInstructions, setHasReadInstructions] = useState(false);
  const [loginError, setLoginError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Initial data fetch (Non-protected routes only)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qs, ss, rs] = await Promise.all([
          questionService.getAll(),
          sessionService.getAll(),
          ruleService.getAll()
        ]);
        setQuestions(qs);
        setSessions(ss);
        setDiagnosticRules(rs);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch student specific attempts when logged in
  useEffect(() => {
    const checkAttemptStatus = async () => {
      if (activeStudent && activeSessionKey) {
        try {
          const studentAttempts = await attemptService.checkStatus(activeStudent.absen, activeSessionKey);
          setAttempts(studentAttempts);
        } catch (err) {
          console.error("Failed to fetch student attempts", err);
        }
      } else {
        setAttempts([]);
      }
    };
    checkAttemptStatus();
  }, [activeStudent, activeSessionKey]);

  // Restore state from localStorage
  useEffect(() => {
    const savedActiveStudent = localStorage.getItem('active_student');
    const savedActiveSessionKey = localStorage.getItem('active_session_key');
    const savedHasReadInstructions = localStorage.getItem('has_read_instructions');
    
    if (savedActiveStudent) setActiveStudent(JSON.parse(savedActiveStudent));
    if (savedActiveSessionKey) setActiveSessionKey(savedActiveSessionKey);
    if (savedHasReadInstructions === 'true') setHasReadInstructions(true);
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    if (activeStudent) localStorage.setItem('active_student', JSON.stringify(activeStudent));
    else localStorage.removeItem('active_student');
  }, [activeStudent]);

  useEffect(() => {
    if (activeSessionKey) localStorage.setItem('active_session_key', activeSessionKey);
    else localStorage.removeItem('active_session_key');
  }, [activeSessionKey]);

  useEffect(() => {
    localStorage.setItem('has_read_instructions', hasReadInstructions.toString());
  }, [hasReadInstructions]);

  const handleStudentLogin = (key: string) => {
    const session = sessions.find(s => s.key === key);
    if (!session) {
      setLoginError("Kunci akses tidak ditemukan.");
      return;
    }

    const now = Date.now();
    const start = new Date(session.startTime).getTime();
    const end = new Date(session.endTime).getTime();

    if (!session.isActive) {
      setLoginError("Sesi akses ini sedang ditutup oleh Admin.");
      return;
    }

    if (now < start) {
      setLoginError(`Sesi belum dimulai. Jadwal mulai: ${new Date(session.startTime).toLocaleString('id-ID')}`);
      return;
    }

    if (now > end) {
      setLoginError("Sesi akses ini telah berakhir.");
      return;
    }

    setActiveSessionKey(key);
    setLoginError(undefined);
  };

  const handleProfileComplete = (data: Student) => {
    setActiveStudent(data);
  };

  const handleFinishQuiz = async (attempt: QuizAttempt) => {
    try {
      const sessionKey = activeSessionKey || '';
      const attemptData = { ...attempt, sessionKey };
      const saved = await attemptService.submit(attemptData);
      setAttempts(prev => [saved, ...prev]);
    } catch (err) {
      console.error("Failed to submit attempt", err);
    }
  };

  const handleLogout = () => {
    setActiveSessionKey(null);
    setActiveStudent(null);
    setHasReadInstructions(false);
    localStorage.removeItem('active_student');
    localStorage.removeItem('active_session_key');
    localStorage.removeItem('has_read_instructions');
  };

  const currentSession = sessions.find(s => s.key === activeSessionKey);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f7f7] flex items-center justify-center">
         <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[#016569] font-black uppercase tracking-widest text-xs">Loading...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f7f7] flex flex-col font-['Inter']">
      <nav className="bg-[#016569] border-b border-[#015255] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <img src="/assets/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-black text-white tracking-tight uppercase cursor-pointer" onClick={() => router.push('/')}>
                Four-tier<span className="text-[#ffdd00]">TEST</span>
              </span>
            </div>

            {(activeSessionKey || activeStudent) && (
              <button onClick={handleLogout} className="text-teal-100 hover:text-[#ffdd00] flex items-center gap-2 font-bold text-xs">
                <span>Keluar</span><i className="fas fa-sign-out-alt"></i>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        {!activeSessionKey ? (
          <StudentLogin onLogin={handleStudentLogin} error={loginError} />
        ) : !hasReadInstructions ? (
          <QuizInstructions 
            onAccept={() => setHasReadInstructions(true)} 
            durationMinutes={currentSession?.durationMinutes || 0}
          />
        ) : !activeStudent ? (
          <StudentProfileForm onComplete={handleProfileComplete} />
        ) : (
          <StudentPortal 
            questions={questions.filter(q => q.subjectIsActive !== false)} 
            onFinishQuiz={handleFinishQuiz}
            student={activeStudent}
            sessionKey={activeSessionKey}
            sessionDuration={currentSession?.durationMinutes || 0}
            onLogout={handleLogout}
            diagnosticRules={diagnosticRules}
            attempts={attempts}
            randomizeQuestions={currentSession?.randomizeQuestions}
          />
        )}
      </main>

      <footer className="bg-white border-t border-teal-50 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
          <p className="text-teal-800/40 text-xs font-medium">© {new Date().getFullYear()} Diagnostic <i>four-tier</i> Test</p>
          <div className="bg-[#016569]/5 px-2 py-0.5 rounded-md text-[#016569] text-[9px] font-black uppercase tracking-widest">
            Versi 2.1.44 (Frontend)
          </div>
        </div>
      </footer>
    </div>
  );
}
