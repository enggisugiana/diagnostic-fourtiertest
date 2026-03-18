import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const { subjectId } = await params;
  try {
    const indicators = await prisma.indicator.findMany({
      where: { subjectId },
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(indicators);
  } catch (error) {
    console.error('Fetch indicators error:', error);
    return NextResponse.json({ error: 'Failed to fetch indicators' }, { status: 500 });
  }
}
