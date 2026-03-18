import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { name, isActive } = await req.json();

    // If activating this subject, deactivate all others first
    if (isActive === true) {
      await prisma.subject.updateMany({
        where: { id: { not: id } },
        data: { isActive: false }
      });
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: { name, isActive }
    });
    return NextResponse.json(subject);
  } catch (error: any) {
    console.error('Update subject error:', error);
    return NextResponse.json({ 
      error: 'Failed to update subject',
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.subject.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete subject error:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
