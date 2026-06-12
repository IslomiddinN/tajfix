'use client';

import { Wrench } from 'lucide-react';
import { RegisterForm } from '@/components/RegisterForm';

export default function MasterRegisterPage() {
  return (
    <RegisterForm
      endpoint="/api/master/register"
      cabinetPath="/master"
      icon={Wrench}
      title="Регистрация мастера"
      subtitle="Создайте аккаунт мастера и принимайте заявки на ремонт."
      submitLabel="Стать мастером"
      extraFields={[
        { name: 'specialization', label: 'Специализация', required: true, placeholder: 'Напр. Ремонт холодильников' },
        { name: 'priceFrom', label: 'Цена от, сом (необязательно)', type: 'number' },
        { name: 'description', label: 'О себе (необязательно)', type: 'textarea' }
      ]}
    />
  );
}
