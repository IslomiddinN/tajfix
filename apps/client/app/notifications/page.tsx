import { NotificationsView } from '@/components/NotificationsView';

export default function NotificationsPage() {
  return (
    <main className="container py-6 sm:py-10">
      <NotificationsView loginCallback="/notifications" />
    </main>
  );
}
