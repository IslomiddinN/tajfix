import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:hello@tajfix.tj';

let configured: boolean | null = null;

function ensureConfigured(): boolean {
  if (configured !== null) return configured;
  if (!publicKey || !privateKey) {
    configured = false;
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

interface PushPayload {
  title: string;
  body?: string;
  link?: string;
  tag?: string;
}

/**
 * Отправляет web-push на все устройства пользователя. Мёртвые подписки (404/410)
 * автоматически удаляются. Best-effort — не бросает исключения наружу.
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  try {
    if (!ensureConfigured()) return;
    const subs = await prisma.pushSubscription.findMany({ where: { userId } });
    if (subs.length === 0) return;

    const data = JSON.stringify(payload);
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            data
          );
        } catch (err: any) {
          const code = err?.statusCode;
          if (code === 404 || code === 410) {
            await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
          }
        }
      })
    );
  } catch {
    // намеренно игнорируем
  }
}
