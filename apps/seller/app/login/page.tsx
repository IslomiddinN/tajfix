import { Suspense } from 'react';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm
        fallbackCallback="/seller"
        title="Вход для магазинов"
        subtitle="Войдите, чтобы открыть кабинет продавца."
        backToSite
      />
    </Suspense>
  );
}
