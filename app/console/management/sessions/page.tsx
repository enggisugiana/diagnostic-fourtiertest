'use client';

import React, { useState, useEffect } from 'react';
import { sessionService, attemptService } from '@/services/api';
import { Session, QuizAttempt } from '@/types';
import AdminSessions from '@/components/admin/AdminSessions';

export default function SessionsPage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ss, aa] = await Promise.all([
        sessionService.getAll(),
        attemptService.getAll()
      ]);
      setSessions(ss);
      setAttempts(aa);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSession = async (name: string, school: string, start: string, end: string, duration: number, key: string) => {
    try {
      const newSession = await sessionService.create({ name, school, startTime: start, endTime: end, durationMinutes: duration, key, randomizeQuestions: false });
      setSessions([...sessions, newSession]);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleToggleSession = async (id: string) => {
    try {
      const updated = await sessionService.toggle(id);
      setSessions(sessions.map(s => s.id === id ? { ...s, isActive: updated.isActive } : s));
    } catch (err) {
      console.error('Failed to toggle session:', err);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await sessionService.delete(id);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-10 w-10 border-4 border-[#016569] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-[#016569] uppercase tracking-widest text-[10px]">Memuat Sesi...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <AdminSessions 
        sessions={sessions} 
        attempts={attempts}
        onAddSession={handleAddSession} 
        onToggleSession={handleToggleSession} 
        onDeleteSession={handleDeleteSession} 
      />
    </div>
  );
}
