import { NotificationsView } from '@/components/NotificationsView';

export default function AdminNotificationsPage() {
  return (
    <NotificationsView
      title="Уведомления"
      subtitle="Новые заказы, заявки, поддержка и регистрации."
      loginCallback="/admin/notifications"
    />
  );
}
