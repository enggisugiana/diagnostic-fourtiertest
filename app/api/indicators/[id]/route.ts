import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const { name } = await req.json();
    const indicator = await prisma.indicator.update({
      where: { id },
      data: { name }
    });
    return NextResponse.json(indicator);
  } catch (error: any) {
    console.error('Update indicator error:', error);
    return NextResponse.json({ 
      error: 'Failed to update indicator',
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    await prisma.indicator.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete indicator error:', error);
    return NextResponse.json({ error: 'Failed to delete indicator' }, { status: 500 });
  }
}
