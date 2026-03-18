import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentNik = searchParams.get('studentNik');
    const sessionKey = searchParams.get('sessionKey');

    const where: any = {};
    if (studentNik) where.studentNik = studentNik;
    if (sessionKey) where.sessionKey = sessionKey;

    const attempts = await prisma.attempt.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    });
    
    const parsedAttempts = attempts.map((a: any) => {
      let answers = [];
      let stats = {};
      let subjectResults = [];

      try {
        answers = typeof a.answers === 'string' ? JSON.parse(a.answers) : a.answers;
      } catch (e) {
        console.error(`Error parsing answers for attempt ${a.id}:`, e);
      }

      try {
        stats = typeof a.stats === 'string' ? JSON.parse(a.stats) : a.stats;
      } catch (e) {
        console.error(`Error parsing stats for attempt ${a.id}:`, e);
      }

      try {
        subjectResults = typeof a.subjectResults === 'string' ? JSON.parse(a.subjectResults) : a.subjectResults;
      } catch (e) {
        console.error(`Error parsing subjectResults for attempt ${a.id}:`, e);
      }

      return {
        ...a,
        answers,
        stats,
        subjectResults
      };
    });
    
    return NextResponse.json(parsedAttempts);
  } catch (error: any) {
    console.error('Fetch attempts error:', error);
    const message = error.code === 'P1001' 
      ? 'Database connection failed. Please check if the database server is running.' 
      : 'Failed to fetch attempts';
    
    return NextResponse.json({ 
      error: message,
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { 
      sessionKey, studentNik, studentName, studentClass, 
      score, points, totalQuestions, durationUsedSeconds, 
      subject, answers, stats, subjectResults 
    } = data;
    
    const attempt = await prisma.attempt.create({
      data: {
        sessionKey,
        studentNik,
        studentName,
        studentClass,
        score,
        points,
        totalQuestions,
        durationUsedSeconds,
        subject,
        answers: JSON.stringify(answers),
        stats: JSON.stringify(stats),
        subjectResults: JSON.stringify(subjectResults)
      }
    });
    
    const parsedAttempt = {
      ...attempt,
      answers: JSON.parse(attempt.answers),
      stats: JSON.parse(attempt.stats),
      subjectResults: JSON.parse(attempt.subjectResults)
    };
    
    return NextResponse.json(parsedAttempt);
  } catch (error: any) {
    console.error('Submit attempt error:', error);
    return NextResponse.json({ error: 'Failed to submit attempt', details: error.message }, { status: 500 });
  }
}
