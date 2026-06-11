import { prisma } from '@/lib/prisma';
import { sendPushToUser } from '@/lib/push';

export type NotificationType = 'order' | 'booking' | 'support' | 'sale' | 'system';

interface Payload {
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

/**
 * Создаёт уведомление для одного пользователя.
 * Никогда не бросает исключение — сбой уведомления не должен ломать основное действие.
 */
export async function notify(userId: string, payload: Payload) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body ?? '',
        link: payload.link ?? ''
      }
    });
  } catch {
    // намеренно игнорируем
  }
  // Web-push на устройства пользователя (не блокирует ответ).
  void sendPushToUser(userId, { title: payload.title, body: payload.body, link: payload.link });
}

/** Уведомление нескольким пользователям (дубликаты userId отсекаются). */
export async function notifyMany(userIds: string[], payload: Payload) {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  if (unique.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: unique.map((userId) => ({
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body ?? '',
        link: payload.link ?? ''
      }))
    });
  } catch {
    // намеренно игнорируем
  }
  // Web-push каждому (не блокирует ответ).
  for (const userId of unique) {
    void sendPushToUser(userId, { title: payload.title, body: payload.body, link: payload.link });
  }
}

/** Уведомление всем администраторам. */
export async function notifyAdmins(payload: Payload) {
  try {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    await notifyMany(
      admins.map((a) => a.id),
      payload
    );
  } catch {
    // намеренно игнорируем
  }
}
