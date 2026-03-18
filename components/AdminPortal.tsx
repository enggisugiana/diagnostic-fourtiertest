import React, { useState } from 'react';
import { Question, QuizAttempt, Session, AdminProfile, DiagnosticRule } from '@/types';
import AdminDashboard from './admin/AdminDashboard';
import AdminSessions from './admin/AdminSessions';
import AdminQuestions from './admin/AdminQuestions';
import AdminResults from './admin/AdminResults';
import AdminSessionAttempts from './admin/AdminSessionAttempts';
import AdminResultDetail from './admin/AdminResultDetail';
import AdminSettings from './admin/AdminSettings';
import AdminSubjects from './admin/AdminSubjects';
import AdminIndicators from './admin/AdminIndicators';

interface AdminPortalProps {
  questions: Question[];
  onAddQuestions: (newQuestions: Omit<Question, 'id'>[]) => void;
  onDeleteQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, updatedData: Partial<Question>) => Promise<void>;
  attempts: QuizAttempt[];
  sessions: Session[];
  onAddSession: (name: string, school: string, startTime: string, endTime: string, durationMinutes: number, key: string) => void;
  onToggleSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  adminProfile: AdminProfile;
  onUpdateAdminProfile: (profile: AdminProfile, oldPassword?: string, newPassword?: string) => Promise<boolean>;
  diagnosticRules: DiagnosticRule[];
  onUpdateAdminProfileHandler: (profile: AdminProfile, oldPassword?: string, newPassword?: string) => Promise<boolean>;
  onUpdateDiagnosticRules: (rules: DiagnosticRule[]) => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ 
  questions, onAddQuestions, onDeleteQuestion, onUpdateQuestion, attempts, sessions,
  onAddSession, onToggleSession, onDeleteSession,
  adminProfile, onUpdateAdminProfile,
  diagnosticRules, onUpdateDiagnosticRules
}) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewParams, setViewParams] = useState<any>({});

  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: 'fa-home' },
    { id: 'sessions', label: 'Sesi', icon: 'fa-calendar-alt' },
    { id: 'subjects', label: 'Bank Soal', icon: 'fa-book' },
    { id: 'results', label: 'Hasil', icon: 'fa-chart-bar' },
    { id: 'settings', label: 'Pengaturan', icon: 'fa-cog' },
  ];

  const navigateTo = (view: string, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo(0, 0);
  };

  const isActiveTab = (tabId: string) => {
    if (tabId === 'subjects' && ['indicators', 'questions'].includes(currentView)) {
      return true;
    }
    if (tabId === 'results' && ['result-session', 'result-detail'].includes(currentView)) {
      return true;
    }
    return currentView === tabId;
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard attempts={attempts} sessions={sessions} questions={questions} diagnosticRules={diagnosticRules} />;
      case 'sessions':
        return (
          <AdminSessions 
            sessions={sessions} 
            onAddSession={onAddSession} 
            onToggleSession={onToggleSession} 
            onDeleteSession={onDeleteSession} 
          />
        );
      case 'subjects':
        return <AdminSubjects onNavigate={navigateTo} />;
      case 'indicators':
        return <AdminIndicators subjectId={viewParams.subjectId} onNavigate={navigateTo} />;
      case 'questions':
        return (
          <AdminQuestions 
            indicatorId={viewParams.indicatorId}
            subjectId={viewParams.subjectId}
            questions={questions} 
            onAddQuestions={onAddQuestions} 
            onDeleteQuestion={onDeleteQuestion} 
            onUpdateQuestion={onUpdateQuestion}
            onNavigate={navigateTo}
          />
        );
      case 'results':
        return <AdminResults attempts={attempts} questions={questions} sessions={sessions} diagnosticRules={diagnosticRules} onNavigate={navigateTo} />;
      case 'result-session':
        return <AdminSessionAttempts sessionKey={viewParams.sessionKey} attempts={attempts} questions={questions} sessions={sessions} diagnosticRules={diagnosticRules} onNavigate={navigateTo} />;
      case 'result-detail':
        return <AdminResultDetail attemptId={viewParams.attemptId} attempts={attempts} questions={questions} diagnosticRules={diagnosticRules} onNavigate={navigateTo} />;
      case 'settings':
        return (
          <AdminSettings 
            profile={adminProfile} 
            onUpdateProfile={onUpdateAdminProfile} 
          />
        );
      default:
        return <AdminDashboard attempts={attempts} sessions={sessions} questions={questions} diagnosticRules={diagnosticRules} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-fadeIn min-h-[calc(100vh-140px)]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col h-auto md:sticky md:top-24 max-h-[calc(100vh-120px)] z-10 pt-2">
        <div className="mb-8 px-4">
          <h1 className="text-xl font-black text-[#016569] uppercase tracking-tight leading-none mb-4">Admin Panel</h1>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center font-black flex-shrink-0">
                <i className="fas fa-user-shield"></i>
             </div>
             <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-700 truncate w-full" title={adminProfile.name}>{adminProfile.name}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Administrator</p>
             </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {tabs.map(tab => {
            const active = isActiveTab(tab.id);
            return (
              <button
                key={tab.id} 
                onClick={() => navigateTo(tab.id)}
                className={`px-6 py-4 rounded-2xl text-[11px] font-black uppercase transition-all flex items-center gap-4 tracking-widest text-left ${active ? 'bg-[#016569] text-white shadow-lg shadow-teal-500/30' : 'text-slate-400 hover:bg-slate-200/50 hover:text-slate-600'}`}
              >
                <i className={`fas ${tab.icon} w-5 text-center text-lg ${active ? 'text-white' : 'text-slate-400'}`}></i>
                <span className="flex-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden w-full min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPortal;
