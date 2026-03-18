import React, { useState, useEffect } from 'react';
import { IndicatorModel } from '@/types';
import { indicatorService, subjectService } from '@/services/api';
import ConfirmModal from '../common/ConfirmModal';

interface AdminIndicatorsProps {
  subjectId: string;
  onNavigate: (view: string, params?: any) => void;
}

const AdminIndicators: React.FC<AdminIndicatorsProps> = ({ subjectId, onNavigate }) => {
  const [indicators, setIndicators] = useState<IndicatorModel[]>([]);
  const [subjectName, setSubjectName] = useState('...Memuat');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');

  // Confirmation Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger'
  });

  useEffect(() => {
    if (subjectId) {
      fetchSubjectData();
      fetchIndicators();
    }
  }, [subjectId]);

  const fetchSubjectData = async () => {
    try {
      const resp = await subjectService.getAll();
      const subjects = resp.data || resp;
      if (Array.isArray(subjects)) {
         const subject = subjects.find((s: any) => s.id === subjectId);
         if (subject) setSubjectName(subject.name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      const resp = await indicatorService.getBySubject(subjectId!);
      const data = resp.data || resp;
      setIndicators(data);
    } catch (err: any) {
      setError('Gagal memuat daftar indikator');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setName('');
    setShowForm(true);
  };

  const handleEdit = (ind: IndicatorModel) => {
    setEditingId(ind.id);
    setName(ind.name);
    setShowForm(true);
  };

  const handleDelete = (id: string, indName: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Indikator?',
      message: `Apakah Anda yakin ingin menghapus indikator "${indName}"? Semua soal di dalamnya akan ikut terhapus secara permanen!`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await indicatorService.delete(id);
          fetchIndicators();
          setModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          alert('Gagal menghapus indikator');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subjectId) return;

    try {
      if (editingId) {
        await indicatorService.update(editingId, { name });
      } else {
        await indicatorService.create({ name, subjectId });
      }
      setShowForm(false);
      fetchIndicators();
    } catch (err) {
      alert('Gagal menyimpan indikator');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-teal-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('subjects')} className="w-10 h-10 rounded-xl bg-teal-50 text-teal-400 hover:bg-[#016569] hover:text-white flex items-center justify-center transition-all">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div>
            <h2 className="text-xl font-black text-[#016569] tracking-tight uppercase">Indikator Soal</h2>
            <p className="text-teal-400 text-xs font-black uppercase tracking-widest mt-1">Subjek: {subjectName}</p>
          </div>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-[#016569] text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-md shadow-teal-500/20 active:scale-95">
          <i className="fas fa-plus"></i>
          <span>Tambah Indikator</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-500 p-4 rounded-xl border border-rose-100 text-sm font-bold flex items-center gap-3">
          <i className="fas fa-exclamation-circle"></i>{error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-teal-50 shadow-sm relative animate-fadeIn">
          <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all">
            <i className="fas fa-times"></i>
          </button>
          <h3 className="text-lg font-black text-[#016569] mb-4 uppercase">{editingId ? 'Edit Indikator' : 'Tambah Indikator Baru'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-black text-teal-400 uppercase tracking-wider block mb-2">Nama Indikator</label>
              <input required autoFocus placeholder="Contoh: Energi Kinetik" className="w-full border border-teal-100 p-3 rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <button type="submit" className="w-full bg-[#016569] text-white py-3 rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-md active:scale-95">
              {editingId ? 'Simpan Perubahan' : 'Simpan Indikator'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-teal-50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-teal-400 text-sm font-bold animate-pulse">Memuat indikator...</div>
        ) : indicators.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-bold">Belum ada indikator untuk subjek ini. Silakan tambah baru.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-teal-50/50 border-b border-teal-50 text-[10px] uppercase tracking-widest text-[#016569]">
                <th className="p-4 pl-6 w-16 text-center">No</th>
                <th className="p-4">Nama Indikator</th>
                <th className="p-4 text-center w-32">Total Soal</th>
                <th className="p-4 text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((ind, idx) => (
                <tr key={ind.id} onClick={() => onNavigate('questions', { indicatorId: ind.id })} className="border-b border-teal-50/50 hover:bg-slate-50/80 transition-colors group cursor-pointer">
                  <td className="p-4 pl-6 text-center text-xs font-black text-slate-300">{idx + 1}</td>
                  <td className="p-4">
                    <p className="text-sm font-black text-[#016569] uppercase tracking-tight">{ind.name}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-teal-50 text-[#016569] px-3 py-1 rounded-lg text-xs font-black border border-teal-100">
                      {ind._count?.questions || 0}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); onNavigate('questions', { indicatorId: ind.id, subjectId: subjectId }); }} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Kelola Soal">
                        <i className="fas fa-file-alt"></i>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(ind); }} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(ind.id, ind.name); }} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Hapus">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};


export default AdminIndicators;
