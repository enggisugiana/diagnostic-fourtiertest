import React, { useState, useEffect } from 'react';
import { SubjectModel } from '@/types';
import { indicatorService, subjectService } from '@/services/api';
import ConfirmModal from '../common/ConfirmModal';

interface AdminSubjectsProps {
  onNavigate: (view: string, params?: any) => void;
}

const AdminSubjects: React.FC<AdminSubjectsProps> = ({ onNavigate }) => {
  const [subjects, setSubjects] = useState<SubjectModel[]>([]);
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
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const resp = await subjectService.getAll();
      const data = resp.data || resp;
      setSubjects(data);
    } catch (err: any) {
      setError('Gagal memuat daftar subjek');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setName('');
    setShowForm(true);
  };

  const handleEdit = (sub: SubjectModel) => {
    setEditingId(sub.id);
    setName(sub.name);
    setShowForm(true);
  };

  const handleDelete = (id: string, subjectName: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Subjek?',
      message: `Apakah Anda yakin ingin menghapus subjek "${subjectName}"? Semua indikator dan soal di dalamnya akan ikut terhapus secara permanen!`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await subjectService.delete(id);
          fetchSubjects();
          setModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          alert('Gagal menghapus subjek');
        }
      }
    });
  };

  const handleToggleActive = (sub: SubjectModel) => {
    const action = sub.isActive ? 'menonaktifkan' : 'mengaktifkan';
    setModalConfig({
      isOpen: true,
      title: `${sub.isActive ? 'Nonaktifkan' : 'Aktifkan'} Subjek?`,
      message: sub.isActive 
        ? `Apakah Anda yakin ingin menonaktifkan subjek "${sub.name}"?` 
        : `Apakah Anda yakin ingin mengaktifkan subjek "${sub.name}"? Keaktifan subjek lain akan dinonaktifkan secara otomatis.`,
      variant: sub.isActive ? 'warning' : 'info',
      onConfirm: async () => {
        try {
          await subjectService.update(sub.id, { name: sub.name, isActive: !sub.isActive });
          fetchSubjects();
          setModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          alert('Gagal mengubah status subjek');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingId) {
        await subjectService.update(editingId, { name });
      } else {
        await subjectService.create({ name });
      }
      setShowForm(false);
      fetchSubjects();
    } catch (err) {
      alert('Gagal menyimpan subjek');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-teal-50 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-[#016569] tracking-tight uppercase">Bank Soal (Subjek)</h2>
          <p className="text-teal-400 text-xs font-black uppercase tracking-widest mt-1">Kelola Materi Dasar Ujian</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-[#016569] text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-md shadow-teal-500/20 active:scale-95">
          <i className="fas fa-plus"></i>
          <span>Tambah Subjek</span>
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
          <h3 className="text-lg font-black text-[#016569] mb-4 uppercase">{editingId ? 'Edit Subjek' : 'Tambah Subjek Baru'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-black text-teal-400 uppercase tracking-wider block mb-2">Nama Subjek / Materi</label>
              <input required autoFocus placeholder="Contoh: Fisika Dasar, Matematika Diskrit" className="w-full border border-teal-100 p-3 rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <button type="submit" className="w-full bg-[#016569] text-white py-3 rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-md active:scale-95">
              {editingId ? 'Simpan Perubahan' : 'Let\'s Go!'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-teal-50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-teal-400 text-sm font-bold animate-pulse">Memuat data subjek...</div>
        ) : subjects.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-bold">Belum ada subjek. Silakan tambah baru.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-teal-50/50 border-b border-teal-50 text-[10px] uppercase tracking-widest text-[#016569]">
                <th className="p-4 pl-6 w-16 text-center">No</th>
                <th className="p-4">Nama Subjek</th>
                <th className="p-4 text-center w-32">Total Indikator</th>
                <th className="p-4 text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub, idx) => (
                <tr key={sub.id} className="border-b border-teal-50/50 hover:bg-slate-50/80 transition-colors group">
                  <td className="p-4 pl-6 text-center text-xs font-black text-slate-300">{idx + 1}</td>
                  <td className="p-4">
                    <p className="text-sm font-black text-[#016569] uppercase tracking-tight">{sub.name}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-teal-50 text-[#016569] px-3 py-1 rounded-lg text-xs font-black border border-teal-100">
                      {sub.indicators?.length || 0}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onNavigate('indicators', { subjectId: sub.id }); }} 
                        className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all shadow-sm" 
                        title="Kelola Indikator"
                      >
                        <i className="fas fa-list-ul"></i>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleActive(sub); }} 
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm ${sub.isActive ? 'bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-400 hover:text-white'}`} 
                        title={sub.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        <i className={`fas ${sub.isActive ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(sub); }} 
                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all shadow-sm" 
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(sub.id, sub.name); }} 
                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm" 
                        title="Hapus"
                      >
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


export default AdminSubjects;
