'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { questionService } from '@/services/api';
import { Question } from '@/types';
import Link from 'next/link';

function EditQuestionContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const questionId = params.questionId as string;
  const indicatorId = searchParams.get('indicatorId');
  const subjectId = searchParams.get('subjectId');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [manualQ, setManualQ] = useState({
    t1Text: '',
    t1Options: ['', '', '', '', ''],
    t1Correct: 0,
    t1Image: '',
    t3Text: '',
    t3Options: ['', '', '', '', ''],
    t3Correct: 0,
    indicatorId: ''
  });

  useEffect(() => {
    if (!questionId) {
       router.push('/console/management/question-list');
       return;
    }

    const fetchQuestion = async () => {
      try {
        const questions = await questionService.getAll();
        const q = questions.find(item => item.id === questionId);
        if (q) {
          setManualQ({
            t1Text: q.t1Text,
            t1Options: q.t1Options,
            t1Correct: q.t1Correct,
            t1Image: q.t1Image || '',
            t3Text: q.t3Text,
            t3Options: q.t3Options,
            t3Correct: q.t3Correct,
            indicatorId: q.indicatorId
          });
        } else {
          alert('Soal tidak ditemukan.');
          router.back();
        }
      } catch (err) {
        console.error('Failed to fetch question:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, router]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQ.indicatorId) {
      alert("Error: indicatorId is missing. Please refresh the page.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        indicatorId: manualQ.indicatorId,
        t1Text: manualQ.t1Text,
        t1Options: manualQ.t1Options,
        t1Correct: manualQ.t1Correct,
        t1Image: manualQ.t1Image,
        t3Text: manualQ.t3Text,
        t3Options: manualQ.t3Options,
        t3Correct: manualQ.t3Correct
      };

      await questionService.update(questionId, payload as any);
      router.push(`/console/management/question-list/${manualQ.indicatorId}?subjectId=${subjectId || ''}`);
    } catch (err: any) {
      console.error('Failed to update question:', err);
      const detail = err.response?.data?.details || err.message;
      alert(`Gagal memperbarui soal: ${detail}`);
    } finally {
      setSaving(false);
    }
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
          canvas.width = img.width;
          canvas.height = img.height;
          if (ctx) {
            ctx.drawImage(img, 0, 0, img.width, img.height);
            let quality = 0.8;
            let finalDataUrl = '';
            let sizeInKB = 0;
            do {
              finalDataUrl = canvas.toDataURL('image/webp', quality);
              sizeInKB = (finalDataUrl.length * (3/4)) / 1024;
              quality -= 0.1;
            } while (sizeInKB > 500 && quality > 0.1);

            if (sizeInKB > 500) {
              alert("Gambar terlalu besar.");
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-10 w-10 border-4 border-[#016569] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-[#016569] uppercase tracking-widest text-[10px]">Memuat Data Soal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-8 border-b border-teal-50 pb-6">
        <div>
           <h2 className="text-2xl font-black text-[#016569] uppercase tracking-tight">Edit Soal 4-Tier</h2>
           <p className="text-teal-400 text-xs font-black uppercase tracking-widest mt-1">Perbarui Pertanyaan & Alasan</p>
        </div>
        <button 
          onClick={() => router.back()} 
          className="bg-teal-50 text-[#016569] px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-teal-100 transition-all border border-teal-100"
        >
          <i className="fas fa-times mr-2"></i> Batal
        </button>
      </div>

      <form onSubmit={handleManualSubmit} className="space-y-8 pb-20">
        <div className="p-6 bg-white rounded-2xl border border-teal-50 shadow-sm space-y-6">
          <h3 className="font-black text-[#016569] text-sm flex items-center gap-3">
            <span className="w-8 h-8 bg-[#016569] text-white rounded-lg flex items-center justify-center text-[10px]">01</span>
            TIER 1: PERTANYAAN KONSEP
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-image"></i> Gambar Pendukung (Opsional)
              </label>
              <div className="flex items-center gap-4 p-4 bg-teal-50/20 rounded-xl border border-dashed border-teal-100">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden" 
                  id="tier1-image-upload" 
                />
                <label 
                  htmlFor="tier1-image-upload" 
                  className="bg-white text-[#016569] px-6 py-3 rounded-xl text-[11px] font-black uppercase cursor-pointer hover:shadow-md transition-all border border-teal-100"
                >
                  <i className="fas fa-upload mr-2"></i> Pilih Gambar
                </label>
                {manualQ.t1Image && (
                  <div className="flex items-center gap-3">
                    <img src={manualQ.t1Image} alt="Preview" className="w-16 h-16 object-cover rounded-xl border-2 border-white shadow-sm" />
                    <button type="button" onClick={removeImage} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Narasi Pertanyaan</label>
               <textarea required placeholder="Tulis pertanyaan konsep di sini..." className="w-full border border-teal-100 p-4 rounded-xl text-sm min-h-[120px] bg-white outline-none focus:border-[#016569]" value={manualQ.t1Text} onChange={e => setManualQ({...manualQ, t1Text: e.target.value})} />
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Pilihan Jawaban & Kunci</label>
               <div className="grid gap-3">
                {manualQ.t1Options.map((opt, i) => (
                  <div key={i} className={`flex gap-3 items-center p-2 rounded-xl border transition-all ${manualQ.t1Correct === i ? 'bg-[#016569]/5 border-[#016569]' : 'bg-white border-teal-50'}`}>
                    <label className="relative flex items-center justify-center cursor-pointer">
                      <input type="radio" name="t1Correct" className="hidden" checked={manualQ.t1Correct === i} onChange={() => setManualQ({...manualQ, t1Correct: i})} />
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${manualQ.t1Correct === i ? 'bg-[#016569] border-[#016569] text-[#ffdd00]' : 'border-teal-100 text-teal-200'}`}>
                        {getOptionLetter(i)}
                      </div>
                    </label>
                    <input required className="flex-1 bg-transparent p-2 text-xs outline-none font-medium" placeholder={`Opsi ${getOptionLetter(i)}`} value={opt} onChange={e => {
                      const newOpts = [...manualQ.t1Options];
                      newOpts[i] = e.target.value;
                      setManualQ({...manualQ, t1Options: newOpts});
                    }} />
                  </div>
                ))}
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-teal-50 shadow-sm space-y-6">
          <h3 className="font-black text-[#016569] text-sm flex items-center gap-3">
            <span className="w-8 h-8 bg-[#ffdd00] text-[#016569] rounded-lg flex items-center justify-center text-[10px]">03</span>
            TIER 3: ALASAN JAWABAN
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Narasi Alasan / Justifikasi</label>
               <textarea required placeholder="Tulis data alasan di sini..." className="w-full border border-teal-100 p-4 rounded-xl text-sm min-h-[120px] bg-white outline-none focus:border-[#016569]" value={manualQ.t3Text} onChange={e => setManualQ({...manualQ, t3Text: e.target.value})} />
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Opsi Alasan & Kunci</label>
               <div className="grid gap-3">
                {manualQ.t3Options.map((opt, i) => (
                  <div key={i} className={`flex gap-3 items-center p-2 rounded-xl border transition-all ${manualQ.t3Correct === i ? 'bg-[#ffdd00]/5 border-[#ffdd00]' : 'bg-white border-teal-50'}`}>
                    <label className="relative flex items-center justify-center cursor-pointer">
                      <input type="radio" name="t3Correct" className="hidden" checked={manualQ.t3Correct === i} onChange={() => setManualQ({...manualQ, t3Correct: i})} />
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${manualQ.t3Correct === i ? 'bg-[#ffdd00] border-[#ffdd00] text-[#016569]' : 'border-teal-100 text-teal-200'}`}>
                        {getOptionLetter(i)}
                      </div>
                    </label>
                    <input required className="flex-1 bg-transparent p-2 text-xs outline-none font-medium" placeholder={`Alasan ${getOptionLetter(i)}`} value={opt} onChange={e => {
                      const newOpts = [...manualQ.t3Options];
                      newOpts[i] = e.target.value;
                      setManualQ({...manualQ, t3Options: newOpts});
                    }} />
                  </div>
                ))}
               </div>
            </div>
          </div>
        </div>

        <button disabled={saving} type="submit" className="w-full bg-[#016569] text-white py-5 rounded-2xl font-black text-sm shadow-2xl hover:bg-[#015255] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
          {saving ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <i className="fas fa-save text-lg"></i>
          )}
          <span>{saving ? 'MEMPERBARUI...' : 'SIMPAN PERUBAHAN SOAL'}</span>
        </button>
      </form>
    </div>
  );
}

export default function EditQuestionPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-10 w-10 border-4 border-[#016569] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-[#016569] uppercase tracking-widest text-[10px]">Memuat Halaman...</p>
      </div>
    }>
      <EditQuestionContent />
    </Suspense>
  );
}
