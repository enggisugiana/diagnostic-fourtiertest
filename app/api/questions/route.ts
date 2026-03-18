import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      include: {
        indicator: {
          include: {
            subject: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const parsedQuestions = questions.map((q: any) => {
      let t1Options = [];
      let t3Options = [];

      try {
        t1Options = typeof q.t1Options === 'string' ? JSON.parse(q.t1Options) : q.t1Options;
      } catch (e) {
        console.error(`Error parsing t1Options for question ${q.id}:`, e);
      }

      try {
        t3Options = typeof q.t3Options === 'string' ? JSON.parse(q.t3Options) : q.t3Options;
      } catch (e) {
        console.error(`Error parsing t3Options for question ${q.id}:`, e);
      }

      return {
        ...q,
        subject: (q.indicator?.subject as any)?.name || '',
        subjectIsActive: (q.indicator?.subject as any)?.isActive ?? true,
        indicatorName: q.indicator?.name || '',
        t1Options,
        t3Options
      };
    });

    return NextResponse.json(parsedQuestions);
  } catch (error: any) {
    console.error('Fetch questions error:', error);
    // Return more descriptive error if possible
    const message = error.code === 'P1001' 
      ? 'Database connection failed. Please check if the database server is running.' 
      : 'Failed to fetch questions';
    
    return NextResponse.json({ 
      error: message,
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { indicatorId, t1Text, t1Options, t1Correct, t1Image, t3Text, t3Options, t3Correct } = await req.json();

    const question = await prisma.question.create({
      data: {
        indicatorId,
        t1Text,
        t1Options: JSON.stringify(t1Options),
        t1Correct: Number(t1Correct),
        t1Image,
        t3Text,
        t3Options: JSON.stringify(t3Options),
        t3Correct: Number(t3Correct)
      }
    });

    return NextResponse.json({ 
      ...question, 
      t1Options: JSON.parse(question.t1Options), 
      t3Options: JSON.parse(question.t3Options) 
    });
  } catch (error: any) {
    console.error('Create question error:', error);
    return NextResponse.json({ 
      error: 'Failed to create question',
      details: error.message
    }, { status: 500 });
  }
}
