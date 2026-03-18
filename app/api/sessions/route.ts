import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Fetch sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, school, startTime, endTime, durationMinutes, key, randomizeQuestions } = await req.json();
    const session = await prisma.session.create({
      data: {
        name,
        school,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        durationMinutes,
        key,
        randomizeQuestions: !!randomizeQuestions
      }
    });
    return NextResponse.json(session);
  } catch (error: any) {
    console.error('Create session error:', error);
    return NextResponse.json({ error: 'Failed to create session', details: error.message }, { status: 500 });
  }
}
