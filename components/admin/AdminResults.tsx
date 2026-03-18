import React, { useMemo } from 'react';
import { QuizAttempt, Question, Session, DiagnosticRule } from '@/types';
import Link from 'next/link';

interface AdminResultsProps {
  attempts: QuizAttempt[];
  questions: Question[];
  sessions: Session[];
  diagnosticRules: DiagnosticRule[];
}

const AdminResults: React.FC<AdminResultsProps> = ({ attempts, sessions }) => {
  const getPerc = (val: number, total: number) => total > 0 ? Number(((val / total) * 100).toFixed(1)) : 0;

  const sessionStats = useMemo(() => {
    return sessions.map(s => {
      const sessionAttempts = attempts.filter(a => a.sessionKey === s.key);
      const studentCount = sessionAttempts.length;
      const avgScore = studentCount > 0 ? (sessionAttempts.reduce((acc, curr) => acc + (curr.stats.pahamKonsep / curr.totalQuestions * 100), 0) / studentCount) : 0;
      
      const aggregateDiagnostic = {
        pahamKonsep: 0, pahamSebagian: 0, miskonsepsi: 0, tidakPahamKonsep: 0, tidakDapatDikategorikan: 0
      };
      
      sessionAttempts.forEach(a => {
        aggregateDiagnostic.pahamKonsep += getPerc(a.stats.pahamKonsep, a.totalQuestions);
        aggregateDiagnostic.pahamSebagian += getPerc(a.stats.pahamSebagian, a.totalQuestions);
        aggregateDiagnostic.miskonsepsi += getPerc(a.stats.miskonsepsi, a.totalQuestions);
        aggregateDiagnostic.tidakPahamKonsep += getPerc(a.stats.tidakPahamKonsep, a.totalQuestions);
        aggregateDiagnostic.tidakDapatDikategorikan += getPerc(a.stats.tidakDapatDikategorikan, a.totalQuestions);
      });

      if (studentCount > 0) {
        aggregateDiagnostic.pahamKonsep = Number((aggregateDiagnostic.pahamKonsep / studentCount).toFixed(1));
        aggregateDiagnostic.pahamSebagian = Number((aggregateDiagnostic.pahamSebagian / studentCount).toFixed(1));
        aggregateDiagnostic.miskonsepsi = Number((aggregateDiagnostic.miskonsepsi / studentCount).toFixed(1));
        aggregateDiagnostic.tidakPahamKonsep = Number((aggregateDiagnostic.tidakPahamKonsep / studentCount).toFixed(1));
        aggregateDiagnostic.tidakDapatDikategorikan = Number((aggregateDiagnostic.tidakDapatDikategorikan / studentCount).toFixed(1));
      }

      return {
        ...s,
        studentCount,
        avgScore,
        avgDiagnostic: aggregateDiagnostic
      };
    });
  }, [sessions, attempts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-teal-50">
        <div>
          <h3 className="text-lg font-black text-[#016569] uppercase tracking-tight leading-none mb-1">Hasil & Analisis Diagnostik</h3>
          <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest italic">Pilih sesi untuk melihat detail pengerjaan</p>
        </div>
        <div className="bg-teal-50 px-4 py-2 rounded-xl text-[10px] font-black text-[#016569] flex items-center gap-2 border border-teal-100 uppercase">
           <i className="fas fa-calendar-check"></i> {sessions.length} Sesi Aktif
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-teal-50 overflow-hidden animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#016569] text-white uppercase font-black">
              <tr>
                <th className="px-6 py-4 w-12 text-center">No.</th>
                <th className="px-6 py-4">Sesi & Sekolah</th>
                <th className="px-6 py-4 text-center">Siswa</th>
                <th className="px-6 py-4">Agregat Diagnostik (%)</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {sessionStats.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-teal-200 font-bold italic border-b border-teal-50 uppercase tracking-widest">Belum ada data pengerjaan</td></tr>
              ) : sessionStats.map((s, idx) => (
                <tr key={s.id} className="hover:bg-teal-50/10 transition-colors">
                  <td className="px-6 py-4 text-center font-black text-teal-200">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="text-[#016569] uppercase font-black">{s.name}</div>
                    <div className="text-[9px] text-teal-400 font-bold uppercase tracking-widest">{s.school}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className="bg-teal-50 text-[#016569] px-3 py-1 rounded-full font-black text-[10px] border border-teal-100">{s.studentCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap gap-x-2 gap-y-1 font-black text-[9px]">
                        {s.avgDiagnostic.pahamKonsep > 0 && <span className="text-emerald-500">PK: {s.avgDiagnostic.pahamKonsep}%</span>}
                        {s.avgDiagnostic.pahamSebagian > 0 && <span className="text-blue-500">PS: {s.avgDiagnostic.pahamSebagian}%</span>}
                        {s.avgDiagnostic.miskonsepsi > 0 && <span className="text-rose-500">M: {s.avgDiagnostic.miskonsepsi}%</span>}
                        {s.avgDiagnostic.tidakPahamKonsep > 0 && <span className="text-amber-500">TPK: {s.avgDiagnostic.tidakPahamKonsep}%</span>}
                        {s.avgDiagnostic.tidakDapatDikategorikan > 0 && <span className="text-slate-400">TDK: {s.avgDiagnostic.tidakDapatDikategorikan}%</span>}
                      </div>
                      
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link 
                      href={`/console/management/results/session/${s.key}`}
                      className="bg-[#016569] text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-[#015255] transition-all shadow-sm flex items-center gap-2 mx-auto w-fit"
                    >
                      <i className="fas fa-eye"></i> Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminResults;
