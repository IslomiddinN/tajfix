import { Home, ClipboardList, Wallet, Star, User, type LucideIcon } from 'lucide-react';

export type MasterTab = { to: string; label: string; icon: LucideIcon; exact?: boolean };

export const MASTER_TABS: MasterTab[] = [
  { to: '/master', label: 'Главная', icon: Home, exact: true },
  { to: '/master/orders', label: 'Заказы', icon: ClipboardList },
  { to: '/master/finance', label: 'Финансы', icon: Wallet },
  { to: '/master/rating', label: 'Рейтинг', icon: Star },
  { to: '/master/profile', label: 'Профиль', icon: User }
];
