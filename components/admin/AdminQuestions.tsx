
import React, { useState, useRef, useEffect } from 'react';
import { Question } from '@/types';
import ConfirmModal from '../common/ConfirmModal';

interface AdminQuestionsProps {
  indicatorId: string;
  subjectId?: string;
  questions: Question[];
  onAddQuestions: (newQuestions: Omit<Question, 'id'>[]) => void;
  onDeleteQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, updatedData: Partial<Question>) => Promise<void>;
  onNavigate: (view: string, params?: any) => void;
}

const AdminQuestions: React.FC<AdminQuestionsProps> = ({ indicatorId, subjectId, questions, onAddQuestions, onDeleteQuestion, onUpdateQuestion, onNavigate }) => {
  const [indicatorName, setIndicatorName] = useState('...Memuat');

  // Filter questions for this specific indicator
  const indicatorQuestions = questions.filter(q => q.indicatorId === indicatorId);

  useEffect(() => {
    if (indicatorId) {
      // Small hack: if we have questions with this indicatorId, use its indicatorName
      // Ideally we would fetch the indicator explicitly by ID
      if (indicatorQuestions.length > 0 && indicatorQuestions[0].indicatorName) {
        setIndicatorName(indicatorQuestions[0].indicatorName);
      } else {
        setIndicatorName('Detail Indikator');
      }
    }
  }, [indicatorId, questions]);

  const [showManualForm, setShowManualForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manualQ, setManualQ] = useState<Omit<Question, 'id' | 'indicatorId' | 'indicatorName' | 'subject'>>({
    t1Text: '',
    t1Options: ['', '', '', '', ''],
    t1Correct: 0,
    t1Image: '',
    t3Text: '',
    t3Options: ['', '', '', '', ''],
    t3Correct: 0
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indicatorId) return;
    
    const submittedData = { ...manualQ, indicatorId };
    
    if (editingQuestionId) {
      await onUpdateQuestion(editingQuestionId, submittedData as any);
      setModalConfig({
        isOpen: true,
        title: 'Sukses',
        message: 'Soal berhasil diperbarui!',
        variant: 'info',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } else {
      onAddQuestions([submittedData as any]);
      setModalConfig({
        isOpen: true,
        title: 'Sukses',
        message: 'Soal baru berhasil ditambahkan!',
        variant: 'info',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    }
    closeForm();
  };

  const closeForm = () => {
    setShowManualForm(false);
    setEditingQuestionId(null);
  };

  const handleEdit = (q: Question) => {
    onNavigate('edit-question', { questionId: q.id, indicatorId, subjectId });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Original dimensions
          let width = img.width;
          let height = img.height;
          
          // Set canvas size
          canvas.width = width;
          canvas.height = height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            
            // Try different quality levels to stay under 500KB
            let quality = 0.8;
            let finalDataUrl = '';
            let sizeInKB = 0;
            
            // Iteratively compress until size is below 500KB
            do {
              finalDataUrl = canvas.toDataURL('image/webp', quality);
              // Base64 size estimation: (string.length * 3/4)
              sizeInKB = (finalDataUrl.length * (3/4)) / 1024;
              quality -= 0.1;
            } while (sizeInKB > 500 && quality > 0.1);

            if (sizeInKB > 500) {
              alert("Gambar tetap melebihi 500KB setelah kompresi. Silakan gunakan gambar yang lebih kecil.");
            } else {
              setManualQ({ ...manualQ, t1Image: finalDataUrl });
            }
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setManualQ({ ...manualQ, t1Image: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  const renderManualForm = () => null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-teal-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('indicators', { subjectId: subjectId })} className="w-10 h-10 rounded-xl bg-teal-50 text-teal-400 hover:bg-[#016569] hover:text-white flex items-center justify-center transition-all">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div>
            <h2 className="text-xl font-black text-[#016569] tracking-tight uppercase">Daftar Soal</h2>
            <p className="text-teal-400 text-xs font-black uppercase tracking-widest mt-1">Indikator: {indicatorName}</p>
          </div>
        </div>
        {!showManualForm && (
          <button 
            onClick={() => onNavigate('add-question', { indicatorId, subjectId })} 
            className="flex items-center gap-2 bg-[#016569] text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-md shadow-teal-500/20 active:scale-95"
          >
            <i className="fas fa-plus"></i>
            <span>Tambah Soal Baru</span>
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-teal-50 overflow-hidden">
        <h3 className="text-lg font-black text-[#016569] p-6 pb-2 border-b border-teal-50 uppercase">Bank Soal ({indicatorQuestions.length})</h3>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#016569] text-white uppercase font-black">
            <tr>
              <th className="px-6 py-4 w-12 text-center">No.</th>
              <th className="px-6 py-4">Informasi Soal (Tier 1)</th>
              <th className="px-6 py-4 text-center">Kunci Jawaban</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-50">
            {indicatorQuestions.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-teal-200 font-bold italic border-b border-teal-50 uppercase tracking-widest">Belum ada soal untuk indikator ini</td></tr>
            ) : indicatorQuestions.map((q, idx) => (
              <tr key={q.id} className="hover:bg-teal-50/10">
                <td className="px-6 py-4 text-center font-black text-teal-200">{idx + 1}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {q.t1Image && (
                      <img src={q.t1Image} alt="Thumb" className="w-8 h-8 rounded border border-teal-50 object-cover" />
                    )}
                    <div className="font-bold text-[#016569] max-w-xs truncate" title={q.t1Text}>{q.t1Text}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-teal-400 uppercase">Konsep:</span>
                      <span className="bg-[#ffdd00]/20 text-[#016569] px-1.5 py-0.5 rounded font-black border border-[#ffdd00]/30">{getOptionLetter(q.t1Correct)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-teal-400 uppercase">Alasan:</span>
                      <span className="bg-[#ffdd00]/20 text-[#016569] px-1.5 py-0.5 rounded font-black border border-[#ffdd00]/30">{getOptionLetter(q.t3Correct)}</span>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(q)} className="w-8 h-8 rounded-md bg-teal-50 text-teal-300 hover:text-[#016569] hover:bg-teal-100 transition-all shadow-sm">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => {
                        setModalConfig({
                          isOpen: true,
                          title: 'Hapus Soal?',
                          message: 'Apakah Anda yakin ingin menghapus soal ini secara permanen?',
                          variant: 'danger',
                          onConfirm: async () => {
                            await onDeleteQuestion(q.id);
                            setModalConfig({
                              isOpen: true,
                              title: 'Terhapus',
                              message: 'Soal telah berhasil dihapus.',
                              variant: 'info',
                              onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                            });
                          }
                        });
                      }} 
                      className="w-8 h-8 rounded-md bg-rose-50 text-rose-300 hover:text-rose-600 hover:bg-rose-100 transition-all shadow-sm"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showManualForm && renderManualForm()}

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

export default AdminQuestions;
