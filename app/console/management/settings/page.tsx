'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '@/services/api';
import { AdminProfile } from '@/types';
import AdminSettings from '@/components/admin/AdminSettings';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AdminProfile>({
    name: 'Administrator',
    email: 'admin@fourtier.test',
    password: ''
  });

  useEffect(() => {
    // In a real app we'd fetch actual profile data
    setLoading(false);
  }, []);

  const handleUpdateProfile = async (newProfile: AdminProfile, oldPass?: string, newPass?: string) => {
    try {
      const res = await authService.updateProfile({ ...newProfile, oldPassword: oldPass, newPassword: newPass });
      if (res.success) {
        setProfile(newProfile);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update profile:', err);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-10 w-10 border-4 border-[#016569] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-[#016569] uppercase tracking-widest text-[10px]">Memuat Pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <AdminSettings profile={profile} onUpdateProfile={handleUpdateProfile} />
    </div>
  );
}
