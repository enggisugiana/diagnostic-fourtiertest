import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        indicators: {
          include: {
            _count: {
              select: { questions: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Fetch subjects error:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    // If new subject is active, deactivate others (implementing the same logic as server)
    await prisma.subject.updateMany({
      data: { isActive: false }
    });

    const subject = await prisma.subject.create({
      data: { name, isActive: true }
    });
    return NextResponse.json(subject);
  } catch (error: any) {
    console.error('Create subject error:', error);
    return NextResponse.json({ 
      error: 'Failed to create subject',
      details: error.message
    }, { status: 500 });
  }
}
