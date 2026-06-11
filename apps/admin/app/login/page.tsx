import { Suspense } from 'react';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm
        fallbackCallback="/admin"
        title="Вход в админ-панель"
        subtitle="Доступ только для администраторов TajFix."
        backToSite
      />
    </Suspense>
  );
}
