import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const masters = await prisma.master.findMany({ orderBy: { rating: 'desc' } });
  return NextResponse.json(masters);
}
