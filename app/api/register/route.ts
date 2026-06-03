import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, password } = body;
  if (!name || !email || !phone || !password) {
    return NextResponse.json({ message: 'Неверные данные' }, { status: 400 });
  }
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (existing) {
    return NextResponse.json({ message: 'Пользователь с таким email или телефоном уже существует' }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, phone, passwordHash } });
  return NextResponse.json({ success: true });
}
