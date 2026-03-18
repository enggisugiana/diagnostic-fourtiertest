import React from 'react';
import { QuizAttempt, Question, DiagnosticRule } from '@/types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface DiagnosticReportViewProps {
  attempt: QuizAttempt;
  questions: Question[];
  diagnosticRules: DiagnosticRule[];
  showEvaluation?: boolean;
  onShowEvaluationToggle?: () => void;
  isAdmin?: boolean;
  onPrint?: () => void;
  onClose?: () => void;
}

const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
};

const getPerc = (val: number, total: number) => total > 0 ? Number(((val / total) * 100).toFixed(1)) : 0;

const DiagnosticReportView: React.FC<DiagnosticReportViewProps> = ({ 
  attempt, questions, diagnosticRules, showEvaluation, onShowEvaluationToggle, isAdmin, onPrint, onClose 
}) => {
  const a = attempt;
  const pieData = [
    { name: 'PK', full: 'Paham Konsep', value: a.stats.pahamKonsep, color: '#10b981' },
    { name: 'PS', full: 'Paham Sebagian', value: a.stats.pahamSebagian, color: '#3b82f6' },
    { name: 'M', full: 'Miskonsepsi', value: a.stats.miskonsepsi, color: '#f43f5e' },
    { name: 'TPK', full: 'Tidak Paham Konsep', value: a.stats.tidakPahamKonsep, color: '#f59e0b' },
    { name: 'L', full: 'Lainnya', value: a.stats.tidakDapatDikategorikan, color: '#94a3b8' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12 printable-content">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-teal-50 print:shadow-none print:rounded-none">
        <div className="flex justify-between items-start mb-6 border-b border-teal-50 pb-4 print:border-teal-100">
          <div>
            <h2 className="text-xl font-black text-[#016569] uppercase tracking-tight">Laporan Diagnostik Siswa</h2>
          </div>
          <div className="flex items-center gap-4 print:hidden">
            {isAdmin && onShowEvaluationToggle && (
              <button 
                onClick={onShowEvaluationToggle}
                className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 transition-all ${showEvaluation ? 'bg-teal-500 text-white shadow-lg' : 'bg-teal-50 text-teal-400'}`}
              >
                <i className={`fas fa-eye${showEvaluation ? '' : '-slash'}`}></i> {showEvaluation ? 'Sembunyikan' : 'Tampilkan'} Evaluasi
              </button>
            )}
            {isAdmin && onPrint && (
              <button 
                onClick={onPrint}
                className="bg-teal-50 text-[#016569] px-4 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-[#ffdd00] transition-all"
              >
                <i className="fas fa-print"></i> Cetak Laporan (PDF)
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="text-teal-200 hover:text-rose-500 transition-all ml-2">
                <i className="fas fa-times text-xl"></i>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 space-y-4">
              <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-100 print:bg-white text-center">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-teal-50 text-teal-400">
                    <i className="fas fa-user-graduate text-xl"></i>
                 </div>
                 <h3 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Identitas Siswa</h3>
                 <p className="font-black text-[#016569] text-lg leading-tight">{a.studentName}</p>
                 <p className="font-bold text-teal-600 text-[11px] mt-1">Kelas: {a.studentClass}</p>
                 <div className="mt-3 inline-block bg-white px-3 py-1 rounded-full border border-teal-100 shadow-sm">
                    <p className="font-bold text-teal-600 text-[10px]"><i className="fas fa-school mr-1 opacity-50"></i> {a.studentNik}</p>
                 </div>
              </div>

              <div className="bg-teal-50/30 p-5 rounded-2xl print:bg-white print:border-2 print:border-teal-100 border border-transparent">
                 <h3 className="text-[10px] font-black text-[#016569] uppercase tracking-widest mb-4 text-center">Profil Pemahaman Agregat</h3>
                 <div className="h-[220px] -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={pieData}>
                        <PolarGrid stroke="#ccfbf1" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#016569', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                        <Radar name="Jumlah Soal" dataKey="value" stroke="#0ea5e9" fill="#38bdf8" fillOpacity={0.5} isAnimationActive={false} />
                        <Tooltip 
                          formatter={(value, name, props: any) => [value, props.payload.full]}
                          contentStyle={{fontSize: '9px', fontWeight: 'bold', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-2 grid grid-cols-2 gap-y-1 gap-x-3 border-t border-teal-100/50 pt-3">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                         <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></div>
                         <span className="text-[8px] font-black text-[#016569] shrink-0">{d.name}:</span>
                         <span className="text-[7px] font-bold text-teal-400 whitespace-nowrap">{d.full}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center print:bg-white print:border-emerald-200">
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Skor Akhir</p>
                 <p className="text-5xl font-black text-emerald-600 leading-none py-2">{a.score}</p>
                 <div className="bg-emerald-100/50 inline-block px-3 py-1 rounded-full mt-2">
                     <p className="text-[9px] font-black text-emerald-600 uppercase">(Benar / Total) × 100</p>
                 </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-teal-50 space-y-3 shadow-sm print:border-teal-100">
                 <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                   <span className="text-[9px] font-black uppercase text-teal-300"><i className="fas fa-stopwatch mr-1"></i> Durasi Pengerjaan</span>
                   <span className="text-[10px] font-black text-[#016569] bg-teal-50 px-2 py-0.5 rounded">{formatDuration(a.durationUsedSeconds)}</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                   <span className="text-[9px] font-black uppercase text-teal-300"><i className="fas fa-list-ol mr-1"></i> Total Soal</span>
                   <span className="text-[10px] font-black text-[#016569] bg-teal-50 px-2 py-0.5 rounded">{a.totalQuestions} Soal</span>
                 </div>
                 <div className="flex justify-between items-center mt-1">
                   <span className="text-[9px] font-black uppercase text-teal-300"><i className="fas fa-calendar-check mr-1"></i> Waktu Selesai</span>
                   <span className="text-[9px] font-bold text-[#016569]">{new Date(a.timestamp).toLocaleString('id-ID')}</span>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-[#016569] uppercase tracking-widest mb-2 border-l-4 border-[#ffdd00] pl-2">Ringkasan Materi & Indikator</h3>
                 <div className="flex flex-col gap-4">
                    {(() => {
                      const categories = [
                        { key: 'pahamKonsep', label: 'Paham Konsep (PK)', color: 'emerald', bg: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-600', icon: 'fa-check-circle' },
                        { key: 'pahamSebagian', label: 'Paham Sebagian (PS)', color: 'blue', bg: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-600', icon: 'fa-dot-circle' },
                        { key: 'miskonsepsi', label: 'Miskonsepsi (M)', color: 'rose', bg: 'bg-rose-50/50', border: 'border-rose-100', text: 'text-rose-600', icon: 'fa-times-circle' },
                        { key: 'tidakPahamKonsep', label: 'Tidak Paham Konsep (TPK)', color: 'amber', bg: 'bg-amber-50/50', border: 'border-amber-100', text: 'text-amber-600', icon: 'fa-exclamation-circle' },
                        { key: 'tidakDapatDikategorikan', label: 'Lainnya (L)', color: 'slate', bg: 'bg-slate-50/50', border: 'border-slate-100', text: 'text-slate-500', icon: 'fa-question-circle' }
                      ];

                      const allIndicators = (a.subjectResults || []).flatMap(sr => (sr.indicators || []).map(ind => ({ ...ind, subject: sr.subject })));
                      
                      const grouped = categories.map(cat => {
                        const indicatorsInCat = allIndicators.filter(ind => {
                          const val = (ind.stats as any)[cat.key];
                          return typeof val === 'number' && val > 0;
                        });
                        const countInCategory = (a.stats as any)[cat.key] || 0;
                        const percentageInCat = getPerc(countInCategory, a.totalQuestions);
                        return { ...cat, items: indicatorsInCat, countInCategory, percentageInCat };
                      });

                      return grouped.map(group => (
                        <div key={group.key} className={`${group.bg} border ${group.border} p-4 rounded-xl`}>
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/50">
                             <i className={`fas ${group.icon} ${group.text} text-xs`}></i>
                             <span className={`text-[10px] font-black uppercase tracking-widest ${group.text}`}>{group.label}</span>
                             <span className={`ml-auto text-[9px] font-black ${group.text} bg-white px-2 py-0.5 rounded-full border ${group.border}`}>
                                Total: {group.countInCategory}/{a.totalQuestions} ({group.percentageInCat}%)
                             </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                             {group.items.length === 0 ? (
                               <p className="text-[9px] font-medium text-slate-400 italic py-2 px-3">Tidak ada data untuk kategori ini.</p>
                             ) : group.items.map((ind, i) => {
                               const val = (ind.stats as any)[group.key] || 0;
                               const percentage = group.countInCategory > 0 ? getPerc(val, group.countInCategory) : 0;
                               return (
                                 <div key={i} className="flex flex-col bg-white/60 p-3 rounded-lg border border-white/80 gap-2">
                                    <div className="flex justify-between items-start">
                                       <div className="flex flex-col">
                                          <span className="text-[9px] font-black text-slate-700 uppercase leading-none">{ind.indicator}</span>
                                          <span className="text-[7px] font-bold text-teal-400 uppercase tracking-tighter mt-0.5">{ind.subject}</span>
                                       </div>
                                       <div className="text-right">
                                          <span className={`text-[10px] font-black ${group.text}`}>{percentage}%</span>
                                          <span className="text-[7px] font-bold text-slate-400 block mt-0.5">{val} dari {group.countInCategory} Soal</span>
                                       </div>
                                    </div>
                                    <div className="flex h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                       <div 
                                         className={`h-full ${
                                           group.key === 'pahamKonsep' ? 'bg-emerald-500' : 
                                           group.key === 'pahamSebagian' ? 'bg-blue-500' : 
                                           group.key === 'miskonsepsi' ? 'bg-rose-500' : 
                                           group.key === 'tidakPahamKonsep' ? 'bg-amber-500' : 
                                           'bg-slate-400'
                                         }`} 
                                         style={{ width: `${percentage}%` }}
                                       ></div>
                                    </div>
                                 </div>
                               );
                             })}
                          </div>
                        </div>
                      ));
                    })()}
                 </div>
              </div>
           </div>
        </div>

        {showEvaluation && (
          <div className="mt-12 space-y-6 print:hidden border-t border-teal-50 pt-8">
            <h3 className="text-xs font-black text-[#016569] uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#016569] text-white flex items-center justify-center italic">?</span>
              Evaluasi Item Pengerjaan
              <div className="h-px flex-1 bg-teal-50"></div>
            </h3>

            <div className="space-y-4">
              {a.answers.map((ans, idx) => {
                const currentQuestion = questions[idx]; 
                if (!currentQuestion) return null;

                const indicatorQuestions = questions.filter(prevQ => prevQ.indicatorId === currentQuestion.indicatorId);
                const relativeNo = indicatorQuestions.findIndex(prevQ => prevQ.id === currentQuestion.id) + 1;

                return (
                  <div key={idx} className="bg-white rounded-xl border border-teal-50 overflow-hidden print:break-inside-avoid">
                    <div className="bg-teal-50/30 px-6 py-3 flex justify-between items-center border-b border-teal-50">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-[#016569] uppercase tracking-widest">Soal No. {relativeNo}</span>
                         <span className="text-[8px] font-bold text-teal-400 uppercase tracking-tight -mt-0.5">{currentQuestion.indicatorName}</span>
                      </div>
                      <div className="flex gap-2">
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${ans.t1 === currentQuestion.t1Correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                           T1: {ans.t1 === currentQuestion.t1Correct ? 'Benar' : 'Salah'}
                         </span>
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${ans.t3 === currentQuestion.t3Correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                           T3: {ans.t3 === currentQuestion.t3Correct ? 'Benar' : 'Salah'}
                         </span>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {currentQuestion.t1Image && (
                        <div className="max-w-[200px] mx-auto mb-4 rounded-lg overflow-hidden border border-teal-50 shadow-sm">
                          <img src={currentQuestion.t1Image} alt="Visual Soal" className="w-full h-auto block max-h-[150px] object-contain" />
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Pertanyaan & Jawaban</p>
                          <p className="text-xs font-bold text-teal-900 leading-relaxed whitespace-pre-wrap">{currentQuestion.t1Text}</p>
                          <div className="mt-2 p-3 bg-teal-50/50 rounded-xl border border-teal-50">
                            <p className="text-[9px] font-bold text-teal-700">Pilihan Siswa: <span className="text-teal-900">{currentQuestion.t1Options[ans.t1] || ans.t1}</span></p>
                            <p className="text-[9px] font-bold text-emerald-600">Jawaban Benar: <span>{currentQuestion.t1Options[currentQuestion.t1Correct] || currentQuestion.t1Correct}</span></p>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center gap-2">
                          <div className={`p-3 rounded-xl border ${ans.t2 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                            <p className="text-[9px] font-black uppercase text-teal-400 mb-1">Keyakinan Jawaban</p>
                            <p className={`text-xs font-black ${ans.t2 ? 'text-emerald-700' : 'text-rose-700'}`}>{ans.t2 ? 'YAKIN' : 'TIDAK YAKIN'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="h-px w-full bg-teal-50"></div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Alasan</p>
                          <p className="text-xs font-bold text-teal-900 leading-relaxed whitespace-pre-wrap">{currentQuestion.t3Text}</p>
                          <div className="mt-2 p-3 bg-teal-50/50 rounded-xl border border-teal-50">
                            <p className="text-[9px] font-bold text-teal-700">Pilihan Siswa: <span className="text-teal-900">{currentQuestion.t3Options[ans.t3] || ans.t3}</span></p>
                            <p className="text-[9px] font-bold text-emerald-600">Alasan Benar: <span>{currentQuestion.t3Options[currentQuestion.t3Correct] || currentQuestion.t3Correct}</span></p>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center gap-2">
                          <div className={`p-3 rounded-xl border ${ans.t4 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                            <p className="text-[9px] font-black uppercase text-teal-400 mb-1">Keyakinan Alasan</p>
                            <p className={`text-xs font-black ${ans.t4 ? 'text-emerald-700' : 'text-rose-700'}`}>{ans.t4 ? 'YAKIN' : 'TIDAK YAKIN'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="mt-12 pt-6 border-t border-teal-50 flex justify-between items-center print:border-teal-100">
           <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
           {onClose && (
             <button onClick={onClose} className="bg-[#016569] text-white px-8 py-3 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-[#015255] transition-all print:hidden">Tutup Laporan</button>
           )}
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          .printable-content, .printable-content * {
            visibility: visible !important;
          }
          .printable-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 5mm !important;
            background: white !important;
            display: block !important;
            z-index: 9999 !important;
          }
          .printable-content {
            zoom: 0.8;
          }
          .printable-content .grid { display: grid !important; }
          .printable-content .lg\\:grid-cols-3 {
            grid-template-columns: 1fr 1.8fr !important;
            gap: 15px !important;
          }
          .printable-content .lg\\:col-span-1 { grid-column: span 1 / span 1 !important; }
          .printable-content .lg\\:col-span-2 { grid-column: span 1 / span 1 !important; }
          .printable-content .bg-emerald-50 { background-color: #ecfdf5 !important; -webkit-print-color-adjust: exact !important; }
          .printable-content .bg-blue-50 { background-color: #eff6ff !important; -webkit-print-color-adjust: exact !important; }
          .printable-content .bg-rose-50 { background-color: #fff1f2 !important; -webkit-print-color-adjust: exact !important; }
          .printable-content .bg-amber-50 { background-color: #fffbeb !important; -webkit-print-color-adjust: exact !important; }
          .printable-content .bg-slate-50 { background-color: #f8fafc !important; -webkit-print-color-adjust: exact !important; }
          .printable-content .bg-emerald-500 { background-color: #10b981 !important; -webkit-print-color-adjust: exact !important; }
          .printable-content .bg-blue-500 { background-color: #3b82f6 !important; -webkit-print-color-adjust: exact !important; }
          .printable-content .bg-rose-500 { background-color: #f43f5e !important; -webkit-print-color-adjust: exact !important; }
          .printable-content .bg-amber-500 { background-color: #f59e0b !important; -webkit-print-color-adjust: exact !important; }
          .printable-content .bg-slate-300, .printable-content .bg-slate-400 { background-color: #94a3b8 !important; -webkit-print-color-adjust: exact !important; }
          .printable-content .bg-slate-100 { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact !important; }
          .printable-content h2 { font-size: 16px !important; }
          .printable-content .text-5xl { font-size: 32px !important; }
          .rounded-2xl { break-inside: avoid; }
          .print\\:hidden, .fas.fa-times {
            display: none !important;
          }
        }
        @page {
          size: auto;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default DiagnosticReportView;
