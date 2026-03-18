
import React, { useState } from 'react';
import { Session, QuizAttempt } from '@/types';
import ConfirmModal from '../common/ConfirmModal';

interface AdminSessionsProps {
  sessions: Session[];
  attempts: QuizAttempt[];
  onAddSession: (name: string, school: string, startTime: string, endTime: string, durationMinutes: number, key: string, randomizeQuestions: boolean) => void;
  onToggleSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

const AdminSessions: React.FC<AdminSessionsProps> = ({ sessions, attempts, onAddSession, onToggleSession, onDeleteSession }) => {
  const [sessionName, setSessionName] = useState('');
  const [school, setSchool] = useState('');
  const now = new Date();
  const getFormattedDate = (d: Date) => {
    // format as YYYY-MM-DD for date input
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  };
  
  const [startDate, setStartDate] = useState(getFormattedDate(now));
  
  const defaultEnd = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days later as default
  const [endDate, setEndDate] = useState(getFormattedDate(defaultEnd));

  const [durH, _setDurH] = useState('00');
  const [durM, _setDurM] = useState('00');
  const [randomize, setRandomize] = useState(false);

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

  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const generateRandomKey = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Harap isi waktu mulai dan selesai.");
      return;
    }
    
    // Make start date exactly 00:00:00 and end date 23:59:59 of selected day
    const startIso = `${startDate}T00:00:00`;
    const endIso = `${endDate}T23:59:59`;
    
    const durTotal = (parseInt(durH) * 60) + parseInt(durM);
    
    if (new Date(startIso).getTime() >= new Date(endIso).getTime()) {
      alert("Waktu mulai harus lebih awal dari waktu selesai.");
      return;
    }
    onAddSession(sessionName, "", startIso, endIso, 0, generateRandomKey(), randomize);
    setSessionName(''); 
    setRandomize(false);
  };

  const formatTimeStr = (iso: string) => {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', ' ');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-50">
        <h3 className="text-sm font-black text-[#016569] uppercase mb-4">Buat Sesi Baru</h3>
        <form onSubmit={handleCreateSession} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" required placeholder="Nama Sesi" className="md:col-span-2 border border-teal-100 p-2.5 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-[#016569] transition-all outline-none" value={sessionName} onChange={e => setSessionName(e.target.value)} />
          
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black text-teal-400 uppercase ml-1">Tentukan Tanggal Akses (Mulai - Selesai)</label>
            <div id="date-range-picker" className="flex items-center">
              <div className="relative w-full">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-teal-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"/></svg>
                </div>
                <input id="datepicker-range-start" name="start" type="date" min={getFormattedDate(now)} required className="bg-slate-50 border border-teal-100 text-[#016569] text-xs rounded-xl focus:ring-1 focus:ring-[#016569] focus:bg-white focus:border-[#016569] block w-full ps-9 pe-3 py-2.5 font-bold shadow-sm transition-all outline-none" placeholder="Pilih tanggal mulai" value={startDate} onChange={e => {
                  setStartDate(e.target.value);
                  if (e.target.value > endDate) setEndDate(e.target.value);
                }} />
              </div>
              <span className="mx-4 text-teal-400 text-xs font-black uppercase">s/d</span>
              <div className="relative w-full">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-teal-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"/></svg>
                </div>
                <input id="datepicker-range-end" name="end" type="date" min={startDate} required className="bg-slate-50 border border-teal-100 text-[#016569] text-xs rounded-xl focus:ring-1 focus:ring-[#016569] focus:bg-white focus:border-[#016569] block w-full ps-9 pe-3 py-2.5 font-bold shadow-sm transition-all outline-none" placeholder="Pilih tanggal selesai" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>

          
          <div className="md:col-span-2 flex items-center gap-2 p-3 bg-teal-50/50 rounded-lg border border-teal-100">
            <input 
              type="checkbox" 
              id="randomize" 
              className="w-4 h-4 text-[#016569] border-teal-100 rounded focus:ring-[#016569]"
              checked={randomize} 
              onChange={e => setRandomize(e.target.checked)} 
            />
            <label htmlFor="randomize" className="text-xs font-black text-[#016569] uppercase cursor-pointer">Acak Urutan Soal Untuk Setiap Siswa</label>
          </div>
          
          <button type="submit" className="md:col-span-2 bg-[#016569] text-white py-3 rounded-xl font-black text-xs uppercase shadow-md hover:bg-[#015255] transition-all">Tambah Sesi</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-teal-50 overflow-hidden">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-[#016569] text-white uppercase font-black">
            <tr>
              <th className="px-6 py-4 w-12 text-center">No.</th>
              <th className="px-6 py-4">Sesi</th>
              <th className="px-6 py-4 text-center">Waktu Akses</th>
              <th className="px-6 py-4 text-center">Kunci</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-50">
            {sessions.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-teal-200 font-bold italic">Belum ada sesi yang dibuat</td></tr>
            ) : sessions.map((s, idx) => {
              const isExpired = new Date() > new Date(s.endTime);
              const statusClass = isExpired 
                ? 'bg-amber-100 text-amber-700' 
                : s.isActive 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'bg-rose-100 text-rose-600';
              const statusLabel = isExpired ? 'Terkunci (Waktu Habis)' : (s.isActive ? 'Aktif' : 'Ditutup');

              return (
                <tr key={s.id} className="hover:bg-teal-50/10">
                  <td className="px-6 py-4 text-center font-black text-teal-200">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#016569]">{s.name}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-[#016569]">
                    {formatTimeStr(s.startTime)} - {formatTimeStr(s.endTime)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-[#ffdd00] px-2 py-0.5 rounded font-mono font-black text-[#016569] shadow-sm">{s.key}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => !isExpired && onToggleSession(s.id)} 
                        disabled={isExpired}
                        className={`w-8 h-8 rounded-md shadow-sm transition-all flex items-center justify-center ${isExpired ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : s.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`} 
                        title={isExpired ? "Sesi terkunci otomatis karena waktu akses telah berakhir" : s.isActive ? "Tutup Sesi" : "Buka Sesi"}
                      >
                        <i className={`fas ${isExpired ? 'fa-lock' : s.isActive ? 'fa-unlock' : 'fa-lock'}`}></i>
                      </button>
                    <button 
                      onClick={() => {
                        setModalConfig({
                          isOpen: true,
                          title: 'Hapus Sesi?',
                          message: `Apakah Anda yakin ingin menghapus sesi "${s.name}"? Semua data pengerjaan siswa dalam sesi ini akan hilang secara permanen!`,
                          variant: 'danger',
                          onConfirm: () => {
                            onDeleteSession(s.id);
                            setModalConfig(prev => ({ ...prev, isOpen: false }));
                          }
                        });
                      }} 
                      className="w-8 h-8 rounded-md bg-rose-50 text-rose-300 hover:text-rose-600 hover:bg-rose-100 shadow-sm transition-all"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
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

export default AdminSessions;
