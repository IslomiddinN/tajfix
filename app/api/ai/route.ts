import { NextResponse } from 'next/server';

const suggestions = [
  {
    keywords: ['стиральная', 'стучит', 'отжиме'],
    reason: 'Износ подшипников или разбалансировка барабана.',
    price: '150–350 сом',
    recommendation: 'Вызовите мастера для диагностики и замены деталей.'
  },
  {
    keywords: ['кондиционер', 'не запускается'],
    reason: 'Проблемы с пусковым реле или утечка хладагента.',
    price: '250–500 сом',
    recommendation: 'Проверьте питание, затем вызовите специалиста по кондиционерам.'
  },
  {
    keywords: ['холодильник', 'не охлаждает'],
    reason: 'Неисправен компрессор или забитый капиллярный трубопровод.',
    price: '200–600 сом',
    recommendation: 'Требуется мастерская диагностика и заправка фреона.'
  },
  {
    keywords: ['телевизор', 'мерцает'],
    reason: 'Нарушение питания панели или повреждение подсветки.',
    price: '180–420 сом',
    recommendation: 'Обратитесь к мастеру для проверки блока питания и экрана.'
  }
];

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = String(body.prompt || '');
  const normalized = prompt.toLowerCase();
  const match = suggestions.find((item) => item.keywords.every((keyword) => normalized.includes(keyword)));
  const answer = match ?? {
    reason: 'Проблема может быть связана с механикой или электроникой устройства.',
    price: '150–550 сом',
    recommendation: 'Свяжитесь с мастером для точной диагностики и ремонта.'
  };
  return NextResponse.json(answer);
}
