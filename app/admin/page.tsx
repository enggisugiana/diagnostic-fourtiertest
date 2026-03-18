'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/console/authorization');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f0f7f7] flex items-center justify-center font-['Inter']">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-[#016569] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-[#016569] uppercase tracking-widest text-xs">Redirecting to Console...</p>
      </div>
    </div>
  );
}
