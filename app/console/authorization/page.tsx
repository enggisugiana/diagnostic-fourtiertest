'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api';
import AdminLogin from '@/components/admin/AdminLogin';
import Link from 'next/link';

export default function AuthorizationPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/console/management');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogin = async (email: string, pass: string) => {
    try {
      setError(null);
      const res = await authService.login(email, pass);
      if (res.success) {
        router.push('/console/management');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f7f7] flex items-center justify-center font-['Inter']">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-[#016569] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f7f7] py-20 px-4 flex flex-col font-['Inter']">
      <AdminLogin onLogin={handleLogin} error={error || undefined} />
    </div>
  );
}
