// Простой in-memory rate limiter по ключу (обычно IP + маршрут).
// Замечание: на serverless (Vercel) состояние живёт в пределах одного инстанса,
// поэтому для жёстких лимитов в проде стоит перейти на Upstash Redis.
// Для защиты от базового спама/перебора этого достаточно.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Периодическая очистка протухших записей, чтобы Map не рос бесконечно.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Возвращает { ok, retryAfter } для ключа.
 * @param key      уникальный ключ (например `${ip}:checkout`)
 * @param limit    максимум запросов за окно
 * @param windowMs длина окна в миллисекундах
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  sweep(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** Достаёт IP клиента из заголовков прокси (Vercel/nginx). */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * Готовый помощник: проверяет лимит и, если превышен, возвращает Response 429.
 * Возвращает null, если запрос можно пропускать дальше.
 */
export function enforceRateLimit(
  request: Request,
  route: string,
  limit: number,
  windowMs: number
): Response | null {
  const ip = getClientIp(request);
  const { ok, retryAfter } = rateLimit(`${ip}:${route}`, limit, windowMs);
  if (ok) return null;
  return new Response(
    JSON.stringify({ message: `Слишком много запросов. Повторите через ${retryAfter} сек.` }),
    {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) }
    }
  );
}
