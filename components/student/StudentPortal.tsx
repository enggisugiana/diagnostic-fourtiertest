'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Question, QuizAttempt, Student, TierAnswer, SubjectResult, DiagnosticRule } from '@/types';
import ConfirmModal from '@/components/common/ConfirmModal';
import DiagnosticReportView from '@/components/common/DiagnosticReportView';

interface StudentPortalProps {
  questions: Question[];
  onFinishQuiz: (attempt: QuizAttempt) => void;
  student: Student;
  sessionKey: string;
  sessionDuration: number;
  onLogout: () => void;
  diagnosticRules: DiagnosticRule[];
  attempts: QuizAttempt[];
  randomizeQuestions?: boolean;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ 
  questions, onFinishQuiz, student, sessionKey, sessionDuration, onLogout, diagnosticRules, attempts, randomizeQuestions
}) => {
  const [activeQuiz, setActiveQuiz] = useState<{
    questions: Question[];
    currentIndex: number;
    answers: TierAnswer[];
    isFinished: boolean;
    startTime: number;
    timeLeft: number;
  } | null>(null);

  const [finishedAttempt, setFinishedAttempt] = useState<QuizAttempt | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const timerRef = useRef<number | null>(null);
  const persistenceKey = `quiz_state_${student.absen}_${sessionKey}`;

  useEffect(() => {
    const existingAttempt = attempts.find(a => a.studentNik === student.absen && a.sessionKey === sessionKey);
    if (existingAttempt) {
      setFinishedAttempt(existingAttempt);
      setActiveQuiz(null);
      return;
    }

    if (questions.length > 0 && !activeQuiz && !finishedAttempt) {
      const savedState = localStorage.getItem(persistenceKey);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (parsed.questions.length === questions.length && !parsed.isFinished) {
            const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
            const initialTotal = sessionDuration * 60;
            const remaining = initialTotal - elapsed;
            
            setActiveQuiz({
              ...parsed,
              timeLeft: remaining > 0 ? remaining : 0
            });
            return;
          }
        } catch (e) {
          console.error("Failed to load saved quiz state", e);
        }
      }

      let quizQuestions = [...questions];
      if (randomizeQuestions) {
        for (let i = quizQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [quizQuestions[i], quizQuestions[j]] = [quizQuestions[j], quizQuestions[i]];
        }
      }

      setActiveQuiz({
        questions: quizQuestions,
        currentIndex: 0,
        answers: quizQuestions.map(q => ({ questionId: q.id, t1: -1, t2: null, t3: -1, t4: null })),
        isFinished: false,
        startTime: Date.now(),
        timeLeft: sessionDuration * 60
      });
    }
  }, [questions, sessionDuration, persistenceKey, finishedAttempt, attempts, student.absen, sessionKey, randomizeQuestions]);

  useEffect(() => {
    if (activeQuiz && !activeQuiz.isFinished) {
      localStorage.setItem(persistenceKey, JSON.stringify(activeQuiz));
    }
  }, [activeQuiz, persistenceKey]);

  const calculateStatsForSubset = (subsetQuestions: Question[], subsetAnswers: TierAnswer[]) => {
    let points = 0;
    const stats = {
      pahamKonsep: 0,
      pahamSebagian: 0,
      miskonsepsi: 0,
      tidakPahamKonsep: 0,
      tidakDapatDikategorikan: 0,
      total: subsetQuestions.length
    };

    subsetAnswers.forEach((ans, idx) => {
      const q = subsetQuestions[idx];
      const t1Correct = ans.t1 === q.t1Correct;
      const t3Correct = ans.t3 === q.t3Correct;
      const t2Sure = ans.t2 === true;
      const t4Sure = ans.t4 === true;

      if (ans.t1 === -1 || ans.t3 === -1 || ans.t2 === null || ans.t4 === null) {
        stats.tidakDapatDikategorikan++;
        return;
      }

      if (t1Correct && t3Correct && t2Sure && t4Sure) {
        stats.pahamKonsep++;
        points++;
      } else if (!t1Correct && !t3Correct && t2Sure && t4Sure) {
        stats.miskonsepsi++;
      } else if (!t1Correct && !t3Correct) {
        stats.tidakPahamKonsep++;
      } else {
        stats.pahamSebagian++;
      }
    });

    return { points, stats };
  };

  const finishQuiz = (quizState: NonNullable<typeof activeQuiz>) => {
    try {
      const subjectGroups: Record<string, Record<string, { qs: Question[], ans: TierAnswer[] }>> = {};
      
      quizState.questions.forEach((q, idx) => {
        const subject = q.subject || 'Lainnya';
        const indicator = q.indicatorName || 'Umum';
        
        if (!subjectGroups[subject]) subjectGroups[subject] = {};
        if (!subjectGroups[subject][indicator]) subjectGroups[subject][indicator] = { qs: [], ans: [] };
        
        subjectGroups[subject][indicator].qs.push(q);
        subjectGroups[subject][indicator].ans.push(quizState.answers[idx]);
      });

      const subjectResults: SubjectResult[] = Object.entries(subjectGroups).map(([subject, indicatorsDict]) => {
        let subjectPoints = 0;
        let subjectQs = 0;
        const subjectStats = {
          pahamKonsep: 0, pahamSebagian: 0, miskonsepsi: 0, tidakPahamKonsep: 0, tidakDapatDikategorikan: 0, total: 0
        };
        
        const indicatorsResults = Object.entries(indicatorsDict).map(([indicator, group]) => {
          const { points, stats } = calculateStatsForSubset(group.qs, group.ans);
          
          subjectPoints += points;
          subjectQs += group.qs.length;
          subjectStats.pahamKonsep += stats.pahamKonsep;
          subjectStats.pahamSebagian += stats.pahamSebagian;
          subjectStats.miskonsepsi += stats.miskonsepsi;
          subjectStats.tidakPahamKonsep += stats.tidakPahamKonsep;
          subjectStats.tidakDapatDikategorikan += stats.tidakDapatDikategorikan;
          subjectStats.total = (subjectStats.total || 0) + (stats.total || 0);
          
          return {
            indicator,
            points,
            totalQuestions: group.qs.length,
            score: group.qs.length > 0 ? Math.round((points / group.qs.length) * 100) : 0,
            stats
          };
        });

        return {
          subject,
          points: subjectPoints,
          totalQuestions: subjectQs,
          score: subjectQs > 0 ? Math.round((subjectPoints / subjectQs) * 100) : 0,
          stats: subjectStats,
          indicators: indicatorsResults
        };
      });

      const { points: totalPoints, stats: overallStats } = calculateStatsForSubset(quizState.questions, quizState.answers);
      const totalQs = quizState.questions.length;
      const finalScore = totalQs > 0 ? Math.round((totalPoints / totalQs) * 100) : 0;
      const durationUsed = Math.floor((Date.now() - quizState.startTime) / 1000);

      const attempt: QuizAttempt = {
        id: Math.random().toString(36).slice(2, 11),
        studentNik: student.absen,
        studentName: student.name,
        studentClass: student.className,
        score: finalScore,
        points: totalPoints,
        totalQuestions: totalQs,
        timestamp: Date.now(),
        durationUsedSeconds: durationUsed,
        subject: "Combined",
        sessionKey,
        answers: quizState.answers,
        stats: overallStats,
        subjectResults: subjectResults
      };

      localStorage.removeItem(persistenceKey);
      setFinishedAttempt(attempt);
      setActiveQuiz(null);
      
      onFinishQuiz(attempt);
    } catch (err) {
      console.error("Error finishing quiz:", err);
      alert("Terjadi kesalahan saat menyimpan hasil. Silakan hubungi admin.");
    }
  };

  const handleUpdateTier = (tier: 1 | 2 | 3 | 4, val: any) => {
    if (!activeQuiz) return;
    const newAnswers = [...activeQuiz.answers];
    const curr = { ...newAnswers[activeQuiz.currentIndex] };
    if (tier === 1) curr.t1 = val;
    if (tier === 2) curr.t2 = val;
    if (tier === 3) curr.t3 = val;
    if (tier === 4) curr.t4 = val;
    newAnswers[activeQuiz.currentIndex] = curr;
    if (!curr.questionId && activeQuiz.questions[activeQuiz.currentIndex]) {
      curr.questionId = activeQuiz.questions[activeQuiz.currentIndex].id;
    }
    setActiveQuiz({ ...activeQuiz, answers: newAnswers });
  };

  useEffect(() => {
    if (activeQuiz) {
      window.scrollTo(0, 0);
    }
  }, [activeQuiz?.currentIndex]);

  useEffect(() => {
    if (activeQuiz && !activeQuiz.isFinished && sessionDuration > 0 && activeQuiz.timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setActiveQuiz(prev => {
          if (!prev) return null;
          if (prev.timeLeft <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            finishQuiz(prev);
            return { ...prev, timeLeft: 0, isFinished: true };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeQuiz?.isFinished, activeQuiz === null, sessionDuration]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60); const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isSetComplete = (ans: TierAnswer) => {
    return ans.t1 !== -1 && ans.t2 !== null && ans.t3 !== -1 && ans.t4 !== null;
  };

  if (finishedAttempt) {
    let a = finishedAttempt;
    try {
      if (typeof a.answers === 'string') a.answers = JSON.parse(a.answers as any);
      if (typeof a.stats === 'string') a.stats = JSON.parse(a.stats as any);
      if (typeof a.subjectResults === 'string') a.subjectResults = JSON.parse(a.subjectResults as any);
    } catch (e) {
      console.error("Failed to parse attempt JSON fields", e);
    }

    if (!a.stats || !a.subjectResults) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-teal-50">
          <i className="fas fa-exclamation-triangle text-amber-400 text-4xl mb-4"></i>
          <h2 className="text-xl font-black text-[#016569] uppercase">Data Hasil Belum Siap</h2>
          <p className="text-teal-400 text-sm mt-2">Sedang memproses data, silakan tunggu sebentar...</p>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto animate-fadeIn pb-12">
        <DiagnosticReportView 
          attempt={a}
          questions={questions}
          diagnosticRules={diagnosticRules}
          isAdmin={false}
        />
      </div>
    );
  }

  if (activeQuiz) {
    const q = activeQuiz.questions[activeQuiz.currentIndex];
    const ans = activeQuiz.answers[activeQuiz.currentIndex];
    const isLast = activeQuiz.currentIndex === activeQuiz.questions.length - 1;

    return (
        <div className="flex flex-col lg:flex-row gap-6 animate-fadeIn pb-12">
            <div className="w-full lg:w-64 flex-shrink-0">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-50 sticky top-24">
                    <h4 className="text-[10px] font-black text-[#016569] uppercase tracking-widest mb-4">Navigasi Soal</h4>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-3 gap-2">
                        {activeQuiz.questions.map((_, i) => {
                            const answered = isSetComplete(activeQuiz.answers[i]);
                            const isActive = activeQuiz.currentIndex === i;
                            return (
                                <button 
                                    key={i} 
                                    onClick={() => setActiveQuiz({...activeQuiz, currentIndex: i})}
                                    className={`aspect-square rounded-lg flex items-center justify-center font-black text-xs transition-all border-2
                                        ${isActive ? 'border-[#ffdd00] bg-[#ffdd00]/10 text-[#016569]' : 
                                          answered ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-teal-50 bg-white text-teal-300 hover:border-teal-200'}
                                    `}
                                >
                                    {i + 1}
                                </button>
                            );
                        })}
                    </div>
                    {sessionDuration > 0 && (
                      <div className="mt-8 pt-6 border-t border-teal-50">
                          <div className={`text-center p-3 rounded-xl font-mono font-black border ${activeQuiz.timeLeft < 60 ? 'bg-rose-500 text-white animate-pulse' : 'bg-[#016569]/5 text-[#016569] border-teal-50'}`}>
                              {formatTime(activeQuiz.timeLeft)}
                          </div>
                      </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-teal-50">
                        <h4 className="text-[10px] font-black text-[#016569] uppercase tracking-widest mb-3">Identitas Siswa</h4>
                        <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-50 space-y-3">
                            <div>
                                <p className="text-[8px] font-black text-teal-400 uppercase leading-none">Asal Sekolah</p>
                                <p className="text-sm font-black text-[#016569]">{student.absen}</p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-teal-400 uppercase leading-none">Nama Lengkap</p>
                                <p className="text-sm font-black text-[#016569]">{student.name}</p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-teal-400 uppercase leading-none">Kelas</p>
                                <p className="text-sm font-black text-[#016569]">{student.className}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-6">
                <div className="bg-[#016569] p-6 rounded-2xl shadow-md text-white flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Latihan 4-Tier</span>
                        <h2 className="text-xl font-black uppercase">Soal Set #{activeQuiz.currentIndex + 1}</h2>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest">
                        {activeQuiz.questions[activeQuiz.currentIndex].subject}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-teal-50 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-teal-50 text-[#016569] w-6 h-6 rounded flex items-center justify-center text-[10px] font-black">1</span>
                        <h3 className="text-sm font-black text-[#016569] uppercase tracking-tight">Tingkat 1: Pertanyaan Konsep</h3>
                    </div>
                    {q.t1Image && (
                      <div className="mb-6 rounded-xl overflow-hidden border border-teal-50 shadow-sm">
                        <img src={q.t1Image} alt="Soal Visual" className="max-w-full h-auto mx-auto block max-h-[400px]" />
                      </div>
                    )}
                    <p className="text-lg font-bold text-[#016569] leading-relaxed mb-6 whitespace-pre-wrap">{q.t1Text}</p>
                    <div className="grid grid-cols-1 gap-2">
                        {q.t1Options.map((opt, i) => (
                            <button key={i} onClick={() => handleUpdateTier(1, i)} className={`flex items-center p-4 rounded-xl border text-left transition-all group ${ans.t1 === i ? 'border-[#ffdd00] bg-[#ffdd00]/10 ring-2 ring-[#ffdd00]/20' : 'border-teal-50 bg-white hover:border-teal-100'}`}>
                                <span className={`w-8 h-8 rounded flex items-center justify-center font-black mr-4 transition-all ${ans.t1 === i ? 'bg-[#ffdd00] text-[#016569]' : 'bg-teal-50 text-teal-300 group-hover:bg-teal-100'}`}>{String.fromCharCode(65+i)}</span>
                                <span className={`text-sm font-bold ${ans.t1 === i ? 'text-[#016569]' : 'text-teal-800/70'}`}>{opt}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-teal-50 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-teal-50 text-[#016569] w-6 h-6 rounded flex items-center justify-center text-[10px] font-black">2</span>
                        <h3 className="text-sm font-black text-[#016569] uppercase tracking-tight">Tingkat 2: Keyakinan Konsep</h3>
                    </div>
                    <p className="text-sm font-bold text-[#016569] mb-4">Seberapa yakin Anda dengan jawaban di atas?</p>
                    <div className="flex gap-4">
                        <button onClick={() => handleUpdateTier(2, true)} className={`flex-1 p-4 rounded-xl border-2 font-black uppercase flex items-center justify-center gap-2 transition-all ${ans.t2 === true ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-teal-50 bg-white text-teal-300'}`}>
                            <i className="fas fa-check-circle"></i> Yakin
                        </button>
                        <button onClick={() => handleUpdateTier(2, false)} className={`flex-1 p-4 rounded-xl border-2 font-black uppercase flex items-center justify-center gap-2 transition-all ${ans.t2 === false ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-teal-50 bg-white text-teal-300'}`}>
                            <i className="fas fa-times-circle"></i> Tidak Yakin
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-teal-50 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-teal-50 text-[#016569] w-6 h-6 rounded flex items-center justify-center text-[10px] font-black">3</span>
                        <h3 className="text-sm font-black text-[#016569] uppercase tracking-tight">Tingkat 3: Alasan Jawaban</h3>
                    </div>
                    <p className="text-lg font-bold text-[#016569] leading-relaxed mb-6 whitespace-pre-wrap">{q.t3Text}</p>
                    <div className="grid grid-cols-1 gap-2">
                        {q.t3Options.map((opt, i) => (
                            <button key={i} onClick={() => handleUpdateTier(3, i)} className={`flex items-center p-4 rounded-xl border text-left transition-all group ${ans.t3 === i ? 'border-[#ffdd00] bg-[#ffdd00]/10 ring-2 ring-[#ffdd00]/20' : 'border-teal-50 bg-white hover:border-teal-100'}`}>
                                <span className={`w-8 h-8 rounded flex items-center justify-center font-black mr-4 transition-all ${ans.t3 === i ? 'bg-[#ffdd00] text-[#016569]' : 'bg-teal-50 text-teal-300 group-hover:bg-teal-100'}`}>{String.fromCharCode(65+i)}</span>
                                <span className={`text-sm font-bold ${ans.t3 === i ? 'text-[#016569]' : 'text-teal-800/70'}`}>{opt}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-teal-50 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-teal-50 text-[#016569] w-6 h-6 rounded flex items-center justify-center text-[10px] font-black">4</span>
                        <h3 className="text-sm font-black text-[#016569] uppercase tracking-tight">Tingkat 4: Keyakinan Alasan</h3>
                    </div>
                    <p className="text-sm font-bold text-[#016569] mb-4">Seberapa yakin Anda dengan alasan yang Anda pilih?</p>
                    <div className="flex gap-4">
                        <button onClick={() => handleUpdateTier(4, true)} className={`flex-1 p-4 rounded-xl border-2 font-black uppercase flex items-center justify-center gap-2 transition-all ${ans.t4 === true ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-teal-50 bg-white text-teal-300'}`}>
                            <i className="fas fa-check-circle"></i> Yakin
                        </button>
                        <button onClick={() => handleUpdateTier(4, false)} className={`flex-1 p-4 rounded-xl border-2 font-black uppercase flex items-center justify-center gap-2 transition-all ${ans.t4 === false ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-teal-50 bg-white text-teal-300'}`}>
                            <i className="fas fa-times-circle"></i> Tidak Yakin
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-6 gap-4">
                    <button disabled={activeQuiz.currentIndex === 0} onClick={() => setActiveQuiz({...activeQuiz, currentIndex: activeQuiz.currentIndex - 1})} className="flex-1 bg-white border border-teal-100 text-[#016569] py-4 rounded-xl font-black text-xs uppercase disabled:opacity-30 transition-all hover:bg-teal-50">
                        <i className="fas fa-arrow-left mr-2"></i> Sebelumnya
                    </button>
                    {isLast ? (
                        <button onClick={() => setIsConfirmModalOpen(true)} className="flex-[2] bg-[#016569] text-white py-4 rounded-xl font-black text-xs uppercase shadow-xl hover:bg-[#015255] transition-all">
                            Selesaikan Latihan < i className="fas fa-paper-plane ml-2"></i>
                        </button>
                    ) : (
                        <button onClick={() => setActiveQuiz({...activeQuiz, currentIndex: activeQuiz.currentIndex + 1})} className="flex-1 bg-white border border-teal-100 text-[#016569] py-4 rounded-xl font-black text-xs uppercase transition-all hover:bg-teal-50">
                            Berikutnya <i className="fas fa-arrow-right ml-2"></i>
                        </button>
                    )}
                </div>
            </div>

            <ConfirmModal 
                isOpen={isConfirmModalOpen}
                title="Selesaikan Latihan?"
                message="Apakah Anda yakin ingin menyelesaikan latihan ini? Pastikan semua soal telah terjawab dengan benar."
                confirmText="Ya, Selesai"
                cancelText="Cek Kembali"
                variant="info"
                onConfirm={() => {
                   setIsConfirmModalOpen(false);
                   if (activeQuiz) finishQuiz(activeQuiz);
                }}
                onCancel={() => setIsConfirmModalOpen(false)}
            />
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-2xl border border-teal-50 shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#016569] tracking-tighter uppercase">Halo, {student.name}!</h1>
          <p className="text-teal-400 font-medium text-xs tracking-widest uppercase font-black">Latihan 4-Tier Diagnostic telah siap.</p>
        </div>
        {sessionDuration > 0 && (
          <div className="text-center md:text-right">
              <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest">Durasi Tersedia</p>
              <p className="text-2xl font-black text-[#016569]">{sessionDuration} Menit</p>
          </div>
        )}
      </div>
      <div className="bg-white p-12 text-center rounded-2xl border border-teal-50 shadow-sm">
         <i className="fas fa-box-open text-teal-100 text-4xl mb-4"></i>
         <p className="text-teal-300 font-bold uppercase tracking-widest text-xs">Menyiapkan soal latihan...</p>
      </div>
    </div>
  );
};

export default StudentPortal;
