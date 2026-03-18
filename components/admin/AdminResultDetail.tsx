import React, { useState } from 'react';
import { QuizAttempt, Question, DiagnosticRule } from '@/types';
import DiagnosticReportView from '../common/DiagnosticReportView';
import Link from 'next/link';

interface AdminResultDetailProps {
  attemptId: string;
  attempts: QuizAttempt[];
  questions: Question[];
  diagnosticRules: DiagnosticRule[];
}

const AdminResultDetail: React.FC<AdminResultDetailProps> = ({ attemptId, attempts, questions, diagnosticRules }) => {
  const [showEvaluation, setShowEvaluation] = useState(false);

  const attempt = attempts.find(a => a.id === attemptId);

  if (!attempt) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-teal-50 text-center space-y-4">
        <i className="fas fa-exclamation-triangle text-amber-400 text-4xl"></i>
        <p className="text-[#016569] font-black uppercase tracking-tight">Hasil tidak ditemukan</p>
        <Link href="/console/management/results" className="bg-[#016569] text-white px-6 py-2 rounded-xl text-xs font-black uppercase">Kembali</Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 space-y-4">
        <Link href={`/console/management/results/session/${attempt.sessionKey}`} className="text-[#016569] font-black text-[10px] uppercase flex items-center gap-2 hover:translate-x-[-4px] transition-all print:hidden">
          <i className="fas fa-arrow-left"></i> Kembali ke Daftar Siswa
        </Link>

      </div>
      
      <DiagnosticReportView 
        attempt={attempt}
        questions={questions}
        diagnosticRules={diagnosticRules}
        isAdmin={true}
        allAttempts={attempts}
        showEvaluation={showEvaluation}
        onShowEvaluationToggle={() => setShowEvaluation(!showEvaluation)}
        onPrint={handlePrint}
      />
    </div>
  );
};

export default AdminResultDetail;
