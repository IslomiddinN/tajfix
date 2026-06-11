import { Suspense } from 'react';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm
        fallbackCallback="/master"
        title="Вход для мастеров"
        subtitle="Войдите, чтобы открыть кабинет мастера."
        backToSite
      />
    </Suspense>
  );
}
