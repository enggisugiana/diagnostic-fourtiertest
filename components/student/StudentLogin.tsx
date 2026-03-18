import React, { useState } from 'react';

interface StudentLoginProps {
  onLogin: (accessKey: string) => void;
  error?: string;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ onLogin, error }) => {
  const [accessKey, setAccessKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey.trim()) {
      onLogin(accessKey.trim());
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12 animate-fadeIn px-4">
      <div className="bg-white rounded-xl shadow-lg border border-teal-50 overflow-hidden">
        <div className="bg-[#016569] p-8 text-center text-white relative">
          <div className="w-14 h-14 bg-[#ffdd00] rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md transform -rotate-3">
            <i className="fas fa-key text-[#016569] text-xl"></i>
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">Portal Latihan</h2>
          <p className="text-teal-100 mt-1 font-medium opacity-80 uppercase tracking-widest text-[10px]">Masukkan kunci akses</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold flex items-center gap-2 border border-red-100 animate-shake">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#016569] uppercase tracking-widest ml-1">Kunci Akses</label>
            <input 
              type="text" 
              required
              className="w-full bg-white border border-teal-100 rounded-lg px-4 py-3 focus:border-[#016569] outline-none transition-all text-[#016569] font-black tracking-[0.2em] text-center text-sm"
              placeholder="XXXX-XXXX"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#ffdd00] hover:bg-[#ffe533] text-[#016569] py-3 rounded-lg font-black text-sm transition-all shadow-md active:scale-[0.98]"
          >
            Masuk Sesi
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
