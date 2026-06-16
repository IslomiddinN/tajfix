import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMobileUser } from '@/lib/mobileToken';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = getMobileUser(request);
  if (!auth) {
    return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { id: true, name: true, email: true, phone: true, role: true }
  });
  if (!user) {
    return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
  }

  return NextResponse.json({ user });
}
