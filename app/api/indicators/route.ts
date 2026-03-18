import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, subjectId } = await req.json();
    const indicator = await prisma.indicator.create({
      data: { name, subjectId }
    });
    return NextResponse.json(indicator);
  } catch (error: any) {
    console.error('Create indicator error:', error);
    return NextResponse.json({ 
      error: 'Failed to create indicator',
      details: error.message
    }, { status: 500 });
  }
}
