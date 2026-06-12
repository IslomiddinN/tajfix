'use client';

import { Store } from 'lucide-react';
import { RegisterForm } from '@/components/RegisterForm';

export default function SellerRegisterPage() {
  return (
    <RegisterForm
      endpoint="/api/seller/register"
      cabinetPath="/seller"
      icon={Store}
      title="Регистрация магазина"
      subtitle="Создайте аккаунт продавца и откройте магазин на TajFix."
      submitLabel="Создать магазин"
      extraFields={[
        { name: 'shopName', label: 'Название магазина', required: true },
        { name: 'description', label: 'Описание (необязательно)', type: 'textarea' },
        { name: 'logoUrl', label: 'Ссылка на логотип (необязательно)', type: 'url' }
      ]}
    />
  );
}
