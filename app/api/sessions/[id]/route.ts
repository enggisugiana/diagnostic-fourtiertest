import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { isActive } = await req.json();
    const updated = await prisma.session.update({
      where: { id },
      data: { isActive: isActive !== undefined ? isActive : !session.isActive }
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update session error:', error);
    return NextResponse.json({ error: 'Failed to update session', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    await prisma.session.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
