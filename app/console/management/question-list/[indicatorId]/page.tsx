'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  questionService, 
  indicatorService 
} from '@/services/api';
import { Question } from '@/types';
import AdminQuestions from '@/components/admin/AdminQuestions';

export default function IndicatorQuestionsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const indicatorId = params.indicatorId as string;
  const subjectId = searchParams.get('subjectId') || undefined;
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const qs = await questionService.getAll();
      setQuestions(qs);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddQuestions = (newQs: Omit<Question, 'id'>[]) => {
    // This will now be handled by a separate page, but we keep the logic for consistency
    fetchData();
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await questionService.delete(id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const handleUpdateQuestion = async (id: string, updatedData: Partial<Question>) => {
    try {
      const updated = await questionService.update(id, updatedData);
      setQuestions(questions.map(q => q.id === id ? { ...q, ...updated } : q));
    } catch (err) {
      console.error('Failed to update question:', err);
    }
  };

  const handleNavigate = (view: string, p?: any) => {
    if (view === 'indicators') {
      router.push(`/console/management/question-list?subjectId=${p.subjectId}`);
    } else if (view === 'add-question') {
      router.push(`/console/management/question-list/add?indicatorId=${p.indicatorId}&subjectId=${p.subjectId}`);
    } else if (view === 'edit-question') {
      router.push(`/console/management/question-list/edit/${p.questionId}?indicatorId=${p.indicatorId}&subjectId=${p.subjectId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-10 w-10 border-4 border-[#016569] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-[#016569] uppercase tracking-widest text-[10px]">Memuat Soal...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <AdminQuestions 
        indicatorId={indicatorId}
        subjectId={subjectId}
        questions={questions}
        onAddQuestions={handleAddQuestions as any}
        onDeleteQuestion={handleDeleteQuestion}
        onUpdateQuestion={handleUpdateQuestion}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
