'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminSubjects from '@/components/admin/AdminSubjects';
import AdminIndicators from '@/components/admin/AdminIndicators';

export default function QuestionListPage() {
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
