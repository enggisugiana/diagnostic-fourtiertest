import React, { useState } from 'react';
import { QuizAttempt, Question, DiagnosticRule } from '@/types';
import DiagnosticReportView from '../common/DiagnosticReportView';

interface AdminResultDetailProps {
  attemptId: string;
  attempts: QuizAttempt[];
  questions: Question[];
  diagnosticRules: DiagnosticRule[];
  onNavigate: (view: string, params?: any) => void;
}

const AdminResultDetail: React.FC<AdminResultDetailProps> = ({ attemptId, attempts, questions, diagnosticRules, onNavigate }) => {
  const [showEvaluation, setShowEvaluation] = useState(false);

  const attempt = attempts.find(a => a.id === attemptId);

  if (!attempt) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-teal-50 text-center space-y-4">
        <i className="fas fa-exclamation-triangle text-amber-400 text-4xl"></i>
        <p className="text-[#016569] font-black uppercase tracking-tight">Hasil tidak ditemukan</p>
        <button onClick={() => onNavigate('results')} className="bg-[#016569] text-white px-6 py-2 rounded-xl text-xs font-black uppercase">Kembali</button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <button onClick={() => onNavigate('result-session', { sessionKey: attempt.sessionKey })} className="text-[#016569] font-black text-[10px] uppercase flex items-center gap-2 hover:translate-x-[-4px] transition-all print:hidden">
          <i className="fas fa-arrow-left"></i> Kembali ke Daftar Siswa
        </button>
      </div>
      
      <DiagnosticReportView 
        attempt={attempt}
        questions={questions}
        diagnosticRules={diagnosticRules}
        isAdmin={true}
        showEvaluation={showEvaluation}
        onShowEvaluationToggle={() => setShowEvaluation(!showEvaluation)}
        onPrint={handlePrint}
      />
    </div>
  );
};

export default AdminResultDetail;
