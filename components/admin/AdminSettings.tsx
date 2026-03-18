
import React, { useState } from 'react';
import { AdminProfile } from '@/types';

interface AdminSettingsProps {
  profile: AdminProfile;
  onUpdateProfile: (newProfile: AdminProfile) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ profile, onUpdateProfile }) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password change if provided (client-side basics only)
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
        return;
      }
      if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password baru minimal 6 karakter.' });
        return;
      }
      if (!oldPassword) {
        setMessage({ type: 'error', text: 'Password lama diperlukan untuk mengubah password.' });
        return;
      }
    }

    const updatedProfile: AdminProfile = {
      name,
      email,
      password: newPassword || profile.password // This is just for local state compatibility
    };

    // We pass the oldPassword explicitly if provided
    (onUpdateProfile as any)(updatedProfile, oldPassword, newPassword);
    setMessage({ type: 'success', text: 'Profil admin berhasil diperbarui.' });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border border-teal-50 overflow-hidden">
        <div className="bg-[#016569] p-6 text-white flex items-center gap-4">
           <div className="w-12 h-12 bg-[#ffdd00] rounded-full flex items-center justify-center">
             <i className="fas fa-cog text-[#016569] text-lg"></i>
           </div>
           <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Pengaturan Admin</h2>
              <p className="text-teal-100 text-[10px] font-bold uppercase opacity-80">Kelola Profil dan Keamanan</p>
           </div>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          {message && (
            <div className={`p-4 rounded-xl text-xs font-black uppercase flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
              <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#016569] uppercase tracking-widest ml-1">Nama Admin</label>
              <input 
                type="text" required
                className="w-full bg-white border border-teal-100 rounded-lg px-4 py-2.5 outline-none text-[#016569] font-bold text-sm focus:border-[#016569]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#016569] uppercase tracking-widest ml-1">Email</label>
              <input 
                type="email" required
                className="w-full bg-white border border-teal-100 rounded-lg px-4 py-2.5 outline-none text-[#016569] font-bold text-sm focus:border-[#016569]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-teal-50">
            <h3 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-4">Ganti Password (Biarkan Kosong Jika Tidak Diganti)</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#016569] uppercase tracking-widest ml-1">Password Lama</label>
                <input 
                  type="password"
                  className="w-full bg-white border border-teal-100 rounded-lg px-4 py-2.5 outline-none text-[#016569] font-bold text-sm focus:border-[#016569]"
                  placeholder="Masukkan password saat ini"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#016569] uppercase tracking-widest ml-1">Password Baru</label>
                  <input 
                    type="password"
                    className="w-full bg-white border border-teal-100 rounded-lg px-4 py-2.5 outline-none text-[#016569] font-bold text-sm focus:border-[#016569]"
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#016569] uppercase tracking-widest ml-1">Konfirmasi Password Baru</label>
                  <input 
                    type="password"
                    className="w-full bg-white border border-teal-100 rounded-lg px-4 py-2.5 outline-none text-[#016569] font-bold text-sm focus:border-[#016569]"
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#ffdd00] text-[#016569] py-4 rounded-xl font-black text-sm uppercase shadow-xl hover:bg-[#ffe533] transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-save"></i>
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
