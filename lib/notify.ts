// Уведомления о новых заказах/заявках через Telegram-бота.
// Настройка: задайте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env.
// Если переменные не заданы, уведомления тихо пропускаются (не ломают заказ).

export async function notifyTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    // Не настроено — пропускаем, чтобы не блокировать оформление заказа.
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
  } catch (err) {
    // Сбой уведомления не должен ронять заказ — просто логируем.
    console.error('Telegram notify failed:', err);
  }
}

const money = (v: number) => `${v} сом`;

export function formatNewOrder(params: {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  items: { title: string; quantity: number; price: number }[];
}): string {
  const lines = params.items
    .map((i) => `• ${i.title} × ${i.quantity} — ${money(i.price * i.quantity)}`)
    .join('\n');
  return [
    '🛒 <b>Новый заказ (магазин)</b>',
    `№ <code>${params.orderId.slice(-8).toUpperCase()}</code>`,
    `👤 ${params.customerName}`,
    `📞 ${params.phone}`,
    `📍 ${params.address}`,
    '',
    lines,
    '',
    `💰 Итого: <b>${money(params.total)}</b>`
  ].join('\n');
}

export function formatNewBooking(params: {
  bookingId: string;
  customerName: string;
  phone: string;
  address: string;
  serviceTitle: string;
  masterName?: string | null;
  problemText: string;
  preferredDate: Date;
  estimatedPrice: number;
}): string {
  return [
    '🔧 <b>Новая заявка на ремонт</b>',
    `№ <code>${params.bookingId.slice(-8).toUpperCase()}</code>`,
    `👤 ${params.customerName}`,
    `📞 ${params.phone}`,
    `📍 ${params.address}`,
    `🛠 Услуга: ${params.serviceTitle}`,
    params.masterName ? `👷 Мастер: ${params.masterName}` : '👷 Мастер: любой',
    `📅 Желаемая дата: ${params.preferredDate.toLocaleString('ru-RU')}`,
    '',
    `📝 ${params.problemText}`,
    '',
    `💰 Оценка: <b>${money(params.estimatedPrice)}</b>`
  ].join('\n');
}
