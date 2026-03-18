'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminSubjects from '@/components/admin/AdminSubjects';
import AdminIndicators from '@/components/admin/AdminIndicators';

function QuestionListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');

  const handleNavigate = (view: string, params: any = {}) => {
    if (view === 'indicators') {
      router.push(`/console/management/question-list?subjectId=${params.subjectId}`);
    } else if (view === 'questions') {
      router.push(`/console/management/question-list/${params.indicatorId}?subjectId=${params.subjectId}`);
    } else if (view === 'subjects') {
      router.push(`/console/management/question-list`);
    }
  };

  return (
    <div className="animate-fadeIn">
      {subjectId ? (
        <AdminIndicators subjectId={subjectId} onNavigate={handleNavigate} />
      ) : (
        <AdminSubjects onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default function QuestionListPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-10 w-10 border-4 border-[#016569] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-[#016569] uppercase tracking-widest text-[10px]">Memuat Halaman...</p>
      </div>
    }>
      <QuestionListContent />
    </Suspense>
  );
}
