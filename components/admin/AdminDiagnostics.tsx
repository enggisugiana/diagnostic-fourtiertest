
import React from 'react';
import { DiagnosticRule, CategoryType } from '@/types';

interface AdminDiagnosticsProps {
  rules: DiagnosticRule[];
  onUpdateRules: (rules: DiagnosticRule[]) => void;
}

const AdminDiagnostics: React.FC<AdminDiagnosticsProps> = ({ rules, onUpdateRules }) => {
  const categories: { value: CategoryType; label: string; color: string }[] = [
    { value: 'pahamKonsep', label: 'Paham Konsep', color: 'text-emerald-600' },
    { value: 'pahamSebagian', label: 'Paham Sebagian', color: 'text-blue-600' },
    { value: 'miskonsepsi', label: 'Miskonsepsi', color: 'text-rose-600' },
    { value: 'tidakPahamKonsep', label: 'Tidak Paham Konsep', color: 'text-amber-600' },
    { value: 'tidakDapatDikategorikan', label: 'Lainnya / Tidak Dapat Dikategorikan', color: 'text-slate-400' },
  ];

  const handleCategoryChange = (id: string, newCategory: CategoryType) => {
    const newRules = rules.map(r => r.id === id ? { ...r, category: newCategory } : r);
    onUpdateRules(newRules);
  };

  const handlePointChange = (id: string, val: boolean) => {
    const newRules = rules.map(r => r.id === id ? { ...r, awardPoint: val } : r);
    onUpdateRules(newRules);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="bg-white p-6 rounded-xl border border-teal-50 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#ffdd00] rounded-lg flex items-center justify-center text-[#016569]">
            <i className="fas fa-project-diagram"></i>
          </div>
          <div>
            <h2 className="text-lg font-black text-[#016569] uppercase tracking-tight">Aturan Pemetaan Diagnostik</h2>
            <p className="text-teal-400 text-[10px] font-bold uppercase tracking-widest">Atur manual kategori berdasarkan kombinasi jawaban 4-Tier</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-[#016569] text-white uppercase font-black">
              <tr>
                <th className="px-4 py-3 text-center">T1 (Konsep)</th>
                <th className="px-4 py-3 text-center">T2 (Yakin)</th>
                <th className="px-4 py-3 text-center">T3 (Alasan)</th>
                <th className="px-4 py-3 text-center">T4 (Yakin)</th>
                <th className="px-4 py-3">Kategori Pemetaan</th>
                <th className="px-4 py-3 text-center">Dapat Poin?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {[...rules].reverse().map((rule) => (
                <tr key={rule.id} className="hover:bg-teal-50/10 transition-colors">
                  <td className="px-4 py-3 text-center">
                    {rule.t1Correct ? <i className="fas fa-check-circle text-emerald-500"></i> : <i className="fas fa-times-circle text-rose-400"></i>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {rule.t2Sure ? <i className="fas fa-shield-alt text-emerald-500"></i> : <i className="fas fa-question-circle text-amber-400"></i>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {rule.t3Correct ? <i className="fas fa-check-circle text-emerald-500"></i> : <i className="fas fa-times-circle text-rose-400"></i>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {rule.t4Sure ? <i className="fas fa-shield-alt text-emerald-500"></i> : <i className="fas fa-question-circle text-amber-400"></i>}
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      className={`w-full bg-teal-50/50 border border-teal-100 p-1.5 rounded text-[10px] font-bold outline-none focus:border-[#016569] ${categories.find(c => c.value === rule.category)?.color}`}
                      value={rule.category}
                      onChange={(e) => handleCategoryChange(rule.id, e.target.value as CategoryType)}
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-[#016569]"
                      checked={rule.awardPoint}
                      onChange={(e) => handlePointChange(rule.id, e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-teal-50 border-l-4 border-[#ffdd00] p-4 rounded-r-lg shadow-sm">
        <h4 className="text-[10px] font-black text-[#016569] uppercase mb-1">Panduan Singkat</h4>
        <p className="text-[10px] text-teal-700 font-medium">
          Setiap baris mewakili logika pengerjaan siswa. Misalnya: Jika T1 Benar, T2 Yakin, T3 Benar, dan T4 Yakin, maka secara default dikategorikan sebagai <strong>Paham Konsep</strong>. Anda bisa mengubah pemetaan ini sesuai dengan metodologi penelitian yang Anda gunakan.
        </p>
      </div>
    </div>
  );
};

export default AdminDiagnostics;
