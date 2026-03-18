import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (email: string, pass: string) => void;
  error?: string;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="max-w-sm mx-auto mt-12 animate-fadeIn px-4">
      <div className="bg-white rounded-xl shadow-lg border border-teal-50 overflow-hidden">
        <div className="bg-[#016569] p-8 text-center text-white">
          <div className="w-14 h-14 bg-[#ffdd00] rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
            <i className="fas fa-user-shield text-[#016569] text-xl"></i>
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">Admin Login</h2>
          <p className="text-teal-100 mt-1 font-medium opacity-80 uppercase tracking-widest text-[10px]">Akses Panel Manajemen</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold flex items-center gap-2 border border-red-100 animate-shake">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#016569] uppercase tracking-widest ml-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-white border border-teal-100 rounded-lg px-4 py-3 focus:border-[#016569] outline-none transition-all text-[#016569] font-bold text-sm"
              placeholder="admin@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#016569] uppercase tracking-widest ml-1">Password</label>
            <div className="relative group/pass">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full bg-white border border-teal-100 rounded-lg pl-4 pr-11 py-3 focus:border-[#016569] outline-none transition-all text-[#016569] font-bold text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-300 hover:text-[#016569] transition-colors p-1"
                title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#016569] text-white py-3 rounded-lg font-black text-sm transition-all shadow-md active:scale-[0.98] hover:bg-[#015255]"
          >
            Masuk Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
