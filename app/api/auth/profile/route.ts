import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  try {
    const { email, name, password, newPassword } = await req.json();

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.password || !(await bcrypt.compare(password, admin.password))) {
      return NextResponse.json(
        { success: false, message: 'Invalid current password' },
        { status: 401 }
      );
    }

    const updateData: any = { name };
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.admin.update({
      where: { email },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      admin: { name: updated.name, email: updated.email },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Update failed' },
      { status: 500 }
    );
  }
}
