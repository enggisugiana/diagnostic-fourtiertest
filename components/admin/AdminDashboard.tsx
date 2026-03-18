
import React from 'react';
import { QuizAttempt, Session, Question, DiagnosticRule } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

interface AdminDashboardProps {
  attempts: QuizAttempt[];
  sessions: Session[];
  questions: Question[];
  diagnosticRules: DiagnosticRule[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ attempts, sessions, questions, diagnosticRules }) => {
  // Metric: Unique Students
  const uniqueStudentAbsens = new Set(attempts.map(a => a.studentNik)).size;

  // Analysis: Overall Diagnostic Categories & Performance
  const aggregateStats = attempts.reduce((acc, attempt) => {
    acc.pahamKonsep += attempt.stats.pahamKonsep;
    acc.pahamSebagian += attempt.stats.pahamSebagian;
    acc.miskonsepsi += attempt.stats.miskonsepsi;
    acc.tidakPahamKonsep += attempt.stats.tidakPahamKonsep;
    acc.tidakDapatDikategorikan += attempt.stats.tidakDapatDikategorikan;
    acc.totalQuestions += attempt.totalQuestions;
    acc.totalPoints += attempt.points;
    return acc;
  }, { 
    pahamKonsep: 0, 
    pahamSebagian: 0, 
    miskonsepsi: 0, 
    tidakPahamKonsep: 0, 
    tidakDapatDikategorikan: 0, 
    totalQuestions: 0,
    totalPoints: 0
  });

  const overallAvgScore = aggregateStats.totalQuestions > 0 
    ? Number(((aggregateStats.totalPoints / aggregateStats.totalQuestions) * 100).toFixed(1)) 
    : 0;

  const totalDiagnosticItems = aggregateStats.pahamKonsep + aggregateStats.pahamSebagian + aggregateStats.miskonsepsi + aggregateStats.tidakPahamKonsep + aggregateStats.tidakDapatDikategorikan;

  const getPercentage = (val: number) => totalDiagnosticItems > 0 ? ((val / totalDiagnosticItems) * 100).toFixed(1) : 0;

  const diagnosticData = [
    { subject: 'PK', value: aggregateStats.pahamKonsep, fullMark: totalDiagnosticItems, label: 'Paham Konsep', color: '#10b981', percent: getPercentage(aggregateStats.pahamKonsep) },
    { subject: 'PS', value: aggregateStats.pahamSebagian, fullMark: totalDiagnosticItems, label: 'Paham Sebagian', color: '#3b82f6', percent: getPercentage(aggregateStats.pahamSebagian) },
    { subject: 'M', value: aggregateStats.miskonsepsi, fullMark: totalDiagnosticItems, label: 'Miskonsepsi', color: '#f43f5e', percent: getPercentage(aggregateStats.miskonsepsi) },
    { subject: 'TPK', value: aggregateStats.tidakPahamKonsep, fullMark: totalDiagnosticItems, label: 'Tidak Paham Konsep', color: '#f59e0b', percent: getPercentage(aggregateStats.tidakPahamKonsep) },
    { subject: 'L', value: aggregateStats.tidakDapatDikategorikan, fullMark: totalDiagnosticItems, label: 'Lainnya', color: '#94a3b8', percent: getPercentage(aggregateStats.tidakDapatDikategorikan) }
  ];

  // Analysis: Detailed Misconceptions
  interface MisconceptionDetail {
    subject: string;
    indicator: string;
    questionNo: number;
    count: number;
  }

  const misconceptionDetails: MisconceptionDetail[] = [];
  
  attempts.forEach(attempt => {
    attempt.answers.forEach((ans, idx) => {
      const q = questions[idx];
      if (!q) return;

      // Detect category using rules
      const ruleKey = `${ans.t1 === q.t1Correct}_${ans.t2 === true}_${ans.t3 === q.t3Correct}_${ans.t4 === true}`;
      const rule = diagnosticRules.find(r => r.id === ruleKey);
      
      if (rule?.category === 'miskonsepsi') {
        const indicatorQuestions = questions.filter(prevQ => prevQ.indicatorId === q.indicatorId);
        const relativeNo = indicatorQuestions.findIndex(prevQ => prevQ.id === q.id) + 1;

        const existing = misconceptionDetails.find(m => m.subject === q.subject && m.indicator === q.indicatorName && m.questionNo === relativeNo);
        if (existing) {
          existing.count += 1;
        } else {
          misconceptionDetails.push({
            subject: q.subject || 'N/A',
            indicator: q.indicatorName || 'N/A',
            questionNo: relativeNo,
            count: 1
          });
        }
      }
    });
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#016569] p-6 rounded-xl text-white shadow-lg border border-teal-600/20">
          <p className="opacity-70 text-[9px] font-black uppercase tracking-widest mb-1">Rata-rata Skor</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-[#ffdd00]">{overallAvgScore}</p>
            <i className="fas fa-star text-teal-400/30 text-2xl"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-teal-50 shadow-sm">
          <p className="text-teal-400 text-[9px] font-black uppercase tracking-widest mb-1">Total Sesi</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-[#016569]">{sessions.length}</p>
            <i className="fas fa-calendar-alt text-[#016569]/10 text-2xl"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-teal-50 shadow-sm">
          <p className="text-teal-400 text-[9px] font-black uppercase tracking-widest mb-1">Total Soal</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-[#016569]">{questions.filter(q => q.subjectIsActive !== false).length}</p>
            <i className="fas fa-file-alt text-[#016569]/10 text-2xl"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-teal-50 shadow-sm">
          <p className="text-teal-400 text-[9px] font-black uppercase tracking-widest mb-1">Jumlah Siswa</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-[#016569]">{uniqueStudentAbsens}</p>
            <i className="fas fa-user-graduate text-[#016569]/10 text-2xl"></i>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Chart: Diagnostic Analysis */}
        <div className="bg-white p-6 rounded-xl border border-teal-50 shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-[10px] font-black text-[#016569] uppercase tracking-widest">Analisis Diagnostik Agregat</h3>
             <i className="fas fa-brain text-teal-100"></i>
          </div>
          {totalDiagnosticItems > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={diagnosticData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar
                    name="Diagnostic"
                    dataKey="value"
                    stroke="#016569"
                    fill="#016569"
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{fontSize: '10px', borderRadius: '12px', fontWeight: '900'}} 
                    formatter={(value: any, name: any, props: any) => [`${value} Jawaban (${props.payload.percent}%)`, props.payload.label]}
                  />
                  <Legend 
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    content={(props) => (
                      <ul className="flex flex-col gap-3 list-none p-0 m-0 ml-6">
                        {diagnosticData.map((entry, index) => (
                          <li key={`item-${index}`} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-[10px] font-black text-slate-600 uppercase">
                              {entry.label}: <span className="text-[#016569]">{entry.value}</span> <span className="text-slate-400 font-bold">({entry.percent}%)</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-teal-200 font-bold italic text-xs uppercase tracking-widest">Belum ada data analisis</div>
          )}
        </div>
      </div>

      {/* Misconception Alert Section */}
      {misconceptionDetails.length > 0 && (
         <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
                <i className="fas fa-exclamation-circle text-rose-500 text-xl"></i>
                <h4 className="font-black text-rose-600 text-sm uppercase tracking-tight">Perhatian: Detail Miskonsepsi Terdeteksi</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {misconceptionDetails.sort((a,b) => b.count - a.count).map((m, idx) => (
                <div key={idx} className="bg-white/50 border border-rose-100 p-3 rounded-lg flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="bg-rose-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Soal #{m.questionNo}</span>
                    <span className="text-rose-500 text-[10px] font-black">{m.count} Siswa</span>
                  </div>
                  <p className="text-[10px] font-black text-rose-700 uppercase tracking-tight truncate" title={m.subject}>{m.subject}</p>
                  <p className="text-[9px] font-bold text-rose-400 leading-tight line-clamp-2">{m.indicator}</p>
                </div>
              ))}
            </div>

            <p className="text-rose-400 text-[10px] font-bold mt-4 leading-relaxed border-t border-rose-100 pt-3 italic">
                * Miskonsepsi didefinisikan sebagai kondisi di mana siswa menjawab salah namun merasa sangat yakin dengan jawabannya (Salah tapi Yakin).
                Disarankan untuk meninjau kembali materi pada indikator-indikator di atas.
            </p>
         </div>
      )}
    </div>
  );
};

export default AdminDashboard;
