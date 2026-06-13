import { NotificationsView } from '@/components/NotificationsView';

export default function SellerNotificationsPage() {
  return (
    <NotificationsView
      title="Уведомления"
      subtitle="Новые продажи, статусы заказов и системные сообщения."
      loginCallback="/seller/notifications"
    />
  );
}
