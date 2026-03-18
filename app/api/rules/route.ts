import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const rules = await prisma.diagnosticRule.findMany();
    return NextResponse.json(rules);
  } catch (error) {
    console.error('Fetch rules error:', error);
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const rules = await req.json();
    
    // Using transaction to update all rules
    await prisma.$transaction(
      rules.map((rule: any) => 
        prisma.diagnosticRule.upsert({
          where: { id: rule.id },
          update: {
            t1Correct: rule.t1Correct,
            t2Sure: rule.t2Sure,
            t3Correct: rule.t3Correct,
            t4Sure: rule.t4Sure,
            category: rule.category,
            awardPoint: rule.awardPoint
          },
          create: {
            id: rule.id,
            t1Correct: rule.t1Correct,
            t2Sure: rule.t2Sure,
            t3Correct: rule.t3Correct,
            t4Sure: rule.t4Sure,
            category: rule.category,
            awardPoint: rule.awardPoint
          }
        })
      )
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update rules error:', error);
    return NextResponse.json({ error: 'Failed to update rules', details: error.message }, { status: 500 });
  }
}
