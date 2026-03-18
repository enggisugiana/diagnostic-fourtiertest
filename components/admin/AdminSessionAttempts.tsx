import React, { useState, useMemo } from 'react';
import { QuizAttempt, Question, Session, DiagnosticRule } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminSessionAttemptsProps {
  sessionKey: string;
  attempts: QuizAttempt[];
  questions: Question[];
  sessions: Session[];
  diagnosticRules: DiagnosticRule[];
  onNavigate: (view: string, params?: any) => void;
}

const AdminSessionAttempts: React.FC<AdminSessionAttemptsProps> = ({ sessionKey, attempts, questions, sessions, diagnosticRules, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const currentSession = sessions.find(s => s.key === sessionKey);

  const stats = useMemo(() => {
    if (!currentSession) return null;
    const sessionAttempts = attempts.filter(a => a.sessionKey === currentSession.key);
    const studentCount = sessionAttempts.length;
    const avgScore = studentCount > 0 ? (sessionAttempts.reduce((acc, curr) => acc + (curr.stats.pahamKonsep / curr.totalQuestions * 100), 0) / studentCount) : 0;
    
    const aggregateDiagnostic = {
      pahamKonsep: 0, pahamSebagian: 0, miskonsepsi: 0, tidakPahamKonsep: 0, tidakDapatDikategorikan: 0
    };
    
    sessionAttempts.forEach(a => {
      const getP = (v: number, t: number) => t > 0 ? (v / t * 100) : 0;
      aggregateDiagnostic.pahamKonsep += getP(a.stats.pahamKonsep, a.totalQuestions);
      aggregateDiagnostic.pahamSebagian += getP(a.stats.pahamSebagian, a.totalQuestions);
      aggregateDiagnostic.miskonsepsi += getP(a.stats.miskonsepsi, a.totalQuestions);
      aggregateDiagnostic.tidakPahamKonsep += getP(a.stats.tidakPahamKonsep, a.totalQuestions);
      aggregateDiagnostic.tidakDapatDikategorikan += getP(a.stats.tidakDapatDikategorikan, a.totalQuestions);
    });

    if (studentCount > 0) {
      aggregateDiagnostic.pahamKonsep = Number((aggregateDiagnostic.pahamKonsep / studentCount).toFixed(1));
      aggregateDiagnostic.pahamSebagian = Number((aggregateDiagnostic.pahamSebagian / studentCount).toFixed(1));
      aggregateDiagnostic.miskonsepsi = Number((aggregateDiagnostic.miskonsepsi / studentCount).toFixed(1));
      aggregateDiagnostic.tidakPahamKonsep = Number((aggregateDiagnostic.tidakPahamKonsep / studentCount).toFixed(1));
      aggregateDiagnostic.tidakDapatDikategorikan = Number((aggregateDiagnostic.tidakDapatDikategorikan / studentCount).toFixed(1));
    }

    return { studentCount, avgScore, avgDiagnostic: aggregateDiagnostic };
  }, [currentSession, attempts]);

  const filteredAttempts = useMemo(() => {
    return attempts.filter(a => 
      a.sessionKey === sessionKey && (
        a.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.studentNik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.studentClass?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [attempts, sessionKey, searchTerm]);

  const totalPages = Math.ceil(filteredAttempts.length / itemsPerPage);
  const currentItems = filteredAttempts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!currentSession || !stats) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-teal-50 text-center space-y-4">
        <i className="fas fa-exclamation-triangle text-amber-400 text-4xl"></i>
        <p className="text-[#016569] font-black uppercase tracking-tight">Sesi tidak ditemukan</p>
        <button onClick={() => onNavigate('results')} className="inline-block bg-[#016569] text-white px-6 py-2 rounded-xl text-xs font-black uppercase">Kembali</button>
      </div>
    );
  }

  const barData = [
    { name: 'PK', value: stats.avgDiagnostic.pahamKonsep, fill: '#10b981' },
    { name: 'PS', value: stats.avgDiagnostic.pahamSebagian, fill: '#3b82f6' },
    { name: 'M', value: stats.avgDiagnostic.miskonsepsi, fill: '#f43f5e' },
    { name: 'TPK', value: stats.avgDiagnostic.tidakPahamKonsep, fill: '#f59e0b' },
    { name: 'TDK', value: stats.avgDiagnostic.tidakDapatDikategorikan, fill: '#94a3b8' }
  ];

  const getPerc = (val: number, total: number) => total > 0 ? Number(((val / total) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <button onClick={() => onNavigate('results')} className="text-[#016569] font-black text-[10px] uppercase flex items-center gap-2 hover:translate-x-[-4px] transition-all">
          <i className="fas fa-arrow-left"></i> Kembali ke Daftar Sesi
        </button>
        <div className="text-right">
           <h2 className="text-xl font-black text-[#016569] uppercase tracking-tight">{currentSession.name}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-1 bg-[#016569] p-8 rounded-2xl shadow-xl text-white flex flex-col justify-center items-center text-center">
            <p className="text-[11px] font-black text-teal-300 uppercase tracking-[0.2em] mb-4">Rata-rata Skor Sesi</p>
            <div className="text-7xl font-black mb-2">{stats.avgScore.toFixed(2)}</div>
            <div className="w-12 h-1 bg-[#ffdd00] rounded-full my-6"></div>
            <p className="text-[10px] font-bold text-teal-100 uppercase tracking-widest">{stats.studentCount} Siswa Berpartisipasi</p>
         </div>

         <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex flex-col">
            <h3 className="text-[11px] font-black text-[#016569] uppercase tracking-widest mb-6 border-l-4 border-[#ffdd00] pl-3">Profil Diagnostik Rata-rata (%)</h3>
            <div className="flex-1 min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fdfa" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: '#f0fdfa'}}
                    contentStyle={{fontSize: '10px', fontWeight: '900', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
               {barData.map(d => (
                  <div key={d.name} className="text-center">
                     <p className="text-[10px] font-black" style={{color: d.fill}}>{d.value.toFixed(1)}%</p>
                     <p className="text-[8px] font-bold text-teal-300 uppercase cursor-help">{d.name}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Misconception Analysis for current session */}
      {(() => {
        interface MisconceptionDetail {
          subject: string;
          indicator: string;
          questionNo: number;
          count: number;
        }
        const sessionMisconceptions: MisconceptionDetail[] = [];
        const sessionAttempts = attempts.filter(a => a.sessionKey === sessionKey);
        
        sessionAttempts.forEach(attempt => {
          attempt.answers.forEach((ans, idx) => {
            const q = questions[idx];
            if (!q) return;
            const ruleKey = `${ans.t1 === q.t1Correct}_${ans.t2 === true}_${ans.t3 === q.t3Correct}_${ans.t4 === true}`;
            const rule = diagnosticRules.find(r => r.id === ruleKey);
            if (rule?.category === 'miskonsepsi') {
              const indicatorQs = questions.filter(prevQ => prevQ.indicatorId === q.indicatorId);
              const relNo = indicatorQs.findIndex(prevQ => prevQ.id === q.id) + 1;
              const existing = sessionMisconceptions.find(m => m.subject === q.subject && m.indicator === q.indicatorName && m.questionNo === relNo);
              if (existing) existing.count++;
              else sessionMisconceptions.push({ subject: q.subject || 'N/A', indicator: q.indicatorName || 'N/A', questionNo: relNo, count: 1 });
            }
          });
        });

        if (sessionMisconceptions.length === 0) return null;

        return (
          <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-2xl animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
                <i className="fas fa-exclamation-circle text-rose-500 text-xl"></i>
                <h4 className="font-black text-rose-600 text-sm uppercase tracking-tight">Peringatan: Miskonsepsi Terdeteksi di Sesi Ini</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sessionMisconceptions.sort((a,b) => b.count - a.count).map((m, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-rose-100 flex flex-col gap-1 shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="bg-rose-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Soal #{m.questionNo}</span>
                    <span className="text-rose-500 text-[10px] font-black">{m.count} Siswa</span>
                  </div>
                  <p className="text-[10px] font-black text-rose-700 uppercase tracking-tight truncate">{m.subject}</p>
                  <p className="text-[9px] font-bold text-rose-400 leading-tight">{m.indicator}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-teal-50">
           <h3 className="text-[11px] font-black text-[#016569] uppercase tracking-widest">Daftar Hasil Siswa</h3>
          <div className="relative w-full md:w-80">
            <input type="text" placeholder="Cari nama atau No. Absen..." className="w-full border border-teal-100 p-2.5 pl-10 rounded-xl text-xs bg-white outline-none focus:border-[#016569]" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
            <i className="fas fa-search absolute left-4 top-3.5 text-teal-200 text-xs"></i>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-teal-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#016569] text-white uppercase font-black">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">No.</th>
                  <th className="px-6 py-4">Siswa & Kelas</th>
                  <th className="px-6 py-4 text-center">Skor</th>
                  <th className="px-6 py-4">Profil Diagnostik (%)</th>
                  <th className="px-6 py-4 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-50">
                {currentItems.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-teal-200 font-bold italic uppercase tracking-widest border-b border-teal-50">Tidak ada siswa yang ditemukan di sesi ini</td></tr>
                ) : currentItems.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-teal-50/10 transition-colors">
                    <td className="px-6 py-4 text-center font-black text-teal-200">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="text-[#016569] uppercase font-black">{a.studentName}</div>
                      <div className="text-[9px] text-teal-400 font-bold uppercase tracking-widest">{a.studentClass} • {a.studentNik}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-[#016569] text-[#ffdd00] px-3 py-1 rounded-lg font-black text-xs border border-[#016569]">
                         {((a.points / a.totalQuestions) * 100).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex h-2 w-40 bg-slate-100 rounded-full overflow-hidden border border-slate-50 mb-2">
                          <div className="bg-emerald-500" style={{width: `${getPerc(a.stats.pahamKonsep, a.totalQuestions)}%`}}></div>
                          <div className="bg-blue-500" style={{width: `${getPerc(a.stats.pahamSebagian, a.totalQuestions)}%`}}></div>
                          <div className="bg-rose-500" style={{width: `${getPerc(a.stats.miskonsepsi, a.totalQuestions)}%`}}></div>
                          <div className="bg-amber-500" style={{width: `${getPerc(a.stats.tidakPahamKonsep, a.totalQuestions)}%`}}></div>
                          <div className="bg-slate-300" style={{width: `${getPerc(a.stats.tidakDapatDikategorikan, a.totalQuestions)}%`}}></div>
                      </div>
                      <div className="flex flex-wrap gap-x-2 gap-y-1 font-black text-[8px] uppercase tracking-tighter">
                        <span className="text-emerald-600">PK:{getPerc(a.stats.pahamKonsep, a.totalQuestions)}%</span>
                        <span className="text-blue-600">PS:{getPerc(a.stats.pahamSebagian, a.totalQuestions)}%</span>
                        <span className="text-rose-600">M:{getPerc(a.stats.miskonsepsi, a.totalQuestions)}%</span>
                        <span className="text-amber-600">TPK:{getPerc(a.stats.tidakPahamKonsep, a.totalQuestions)}%</span>
                        <span className="text-slate-400">TDK:{getPerc(a.stats.tidakDapatDikategorikan, a.totalQuestions)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => onNavigate('result-detail', { attemptId: a.id })} title="Lihat Detail Hasil" className="bg-teal-50 text-[#016569] w-8 h-8 rounded-xl hover:bg-[#ffdd00] hover:text-[#016569] transition-all border border-teal-100 shadow-sm flex items-center justify-center mx-auto">
                        <i className="fas fa-id-card"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 bg-white border-t border-teal-50 flex justify-between items-center">
              <div className="text-[10px] font-black text-teal-300 uppercase tracking-widest">Halaman {currentPage} dari {totalPages}</div>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="w-9 h-9 rounded-xl bg-teal-50 text-[#016569] disabled:opacity-30 hover:bg-teal-100 transition-all border border-teal-100">
                  <i className="fas fa-chevron-left text-[11px]"></i>
                </button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="w-9 h-9 rounded-xl bg-teal-50 text-[#016569] disabled:opacity-30 hover:bg-teal-100 transition-all border border-teal-100">
                  <i className="fas fa-chevron-right text-[11px]"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSessionAttempts;
