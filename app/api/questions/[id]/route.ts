import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    console.log('UPDATING QUESTION ID:', id);
    console.log('PAYLOAD:', body);

    const { indicatorId, t1Text, t1Options, t1Correct, t1Image, t3Text, t3Options, t3Correct } = body;

    if (!id) throw new Error("Question ID is required from params");

    const question = await prisma.question.update({
      where: { id },
      data: {
        indicatorId,
        t1Text,
        t1Options: typeof t1Options === 'string' ? t1Options : JSON.stringify(t1Options),
        t1Correct: Number(t1Correct),
        t1Image,
        t3Text,
        t3Options: typeof t3Options === 'string' ? t3Options : JSON.stringify(t3Options),
        t3Correct: Number(t3Correct)
      }
    });

    return NextResponse.json({ 
      ...question, 
      t1Options: JSON.parse(question.t1Options), 
      t3Options: JSON.parse(question.t3Options) 
    });
  } catch (error: any) {
    console.error('Update question error:', error);
    return NextResponse.json({ 
      error: 'Failed to update question',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.question.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete question error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete question',
      details: error.message 
    }, { status: 500 });
  }
}
