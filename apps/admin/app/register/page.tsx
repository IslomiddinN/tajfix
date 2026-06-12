'use client';

import { ShieldCheck } from 'lucide-react';
import { RegisterForm } from '@/components/RegisterForm';

export default function AdminRegisterPage() {
  return (
    <RegisterForm
      endpoint="/api/admin/register"
      cabinetPath="/admin"
      icon={ShieldCheck}
      title="Регистрация администратора"
      subtitle="Доступ по коду регистрации. Получите код у владельца системы."
      submitLabel="Создать аккаунт"
      extraFields={[{ name: 'code', label: 'Код регистрации', type: 'password', required: true }]}
    />
  );
}
