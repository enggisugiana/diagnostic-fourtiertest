import React, { useState } from 'react';

interface StudentProfileFormProps {
  onComplete: (data: { absen: string; name: string; className: string }) => void;
}

const StudentProfileForm: React.FC<StudentProfileFormProps> = ({ onComplete }) => {
  const [absen, setAbsen] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (absen && name && className) {
      onComplete({ absen, name, className });
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 animate-fadeIn px-4">
      <div className="bg-white rounded-xl shadow-lg border border-teal-50 overflow-hidden">
        <div className="bg-[#016569] p-8 text-center text-white">
          <div className="w-12 h-12 bg-[#ffdd00] rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md transform rotate-3">
            <i className="fas fa-id-badge text-[#016569] text-xl"></i>
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">Data Identitas</h2>
          <p className="text-teal-100 mt-1 font-medium opacity-80 text-xs">Lengkapi data untuk memulai latihan</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#016569] uppercase tracking-widest ml-1">Nama Lengkap</label>
            <input 
              type="text" required
              className="w-full bg-white border border-teal-100 rounded-lg px-4 py-2.5 outline-none text-[#016569] font-bold text-sm"
              placeholder="Masukan Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#016569] uppercase tracking-widest ml-1">Kelas</label>
            <input 
              type="text" required
              className="w-full bg-white border border-teal-100 rounded-lg px-4 py-2.5 outline-none text-[#016569] font-bold text-sm"
              placeholder="Mis: 11-A"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>

		  <div className="space-y-1">
            <label className="text-[10px] font-black text-[#016569] uppercase tracking-widest ml-1">Nama Sekolah</label>
            <input 
              type="text" required
              className="w-full bg-white border border-teal-100 rounded-lg px-4 py-2.5 outline-none text-[#016569] font-bold text-sm"
              placeholder="Masukkan Nama Sekolah"
              value={absen}
              onChange={(e) => setAbsen(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#ffdd00] hover:bg-[#ffe533] text-[#016569] py-3 rounded-lg font-black text-sm transition-all shadow-md active:scale-[0.98] mt-2"
          >
            Mulai Latihan
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfileForm;
