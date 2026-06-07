import Link from 'next/link';
import { Briefcase, Handshake, Phone, Send, Wrench } from 'lucide-react';

export const metadata = {
  title: 'Работа и сотрудничество — TajFix',
  description: 'Вакансии TajFix и как стать мастером-партнёром.'
};

const vacancies = [
  { title: 'Мастер по ремонту техники', city: 'Душанбе', type: 'Полная занятость / партнёрство', desc: 'Выезд к клиентам, диагностика и ремонт бытовой техники.' },
  { title: 'Курьер', city: 'Душанбе', type: 'Полная / частичная занятость', desc: 'Доставка техники из магазина клиентам по городу.' },
  { title: 'Оператор поддержки', city: 'Душанбе / удалённо', type: 'Полная занятость', desc: 'Приём заявок, консультации клиентов по телефону и в чате.' }
];

const partnerSteps = [
  'Оставьте заявку по телефону или в Telegram',
  'Пройдите короткое собеседование и проверку навыков',
  'Получите доступ в кабинет мастера и первые заказы',
  'Работайте по удобному графику и получайте оплату за заказы'
];

export default function CareersPage() {
  return (
    <main className="container py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4 text-primary" /> Карьера в TajFix
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">Работайте и зарабатывайте с нами</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Мы растём по всему Таджикистану и ищем мастеров, курьеров и операторов. Присоединяйтесь к команде или станьте мастером-партнёром.
        </p>
      </div>

      {/* Стать мастером */}
      <section className="mb-10 rounded-[32px] border border-border bg-secondary p-8 text-foreground">
        <div className="flex items-center gap-2 text-sm text-primary">
          <Handshake className="h-4 w-4" /> Тем, кто хочет работать с нами
        </div>
        <h2 className="mt-3 text-2xl font-semibold">Станьте мастером-партнёром</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Получайте заявки на ремонт рядом с вами, управляйте ими в личном кабинете и работайте по своему графику.
        </p>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {partnerSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl bg-card p-4">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold">{i + 1}</span>
              <span className="text-sm text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="https://t.me/qashqay12" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold transition hover:bg-primary">
            <Send className="h-4 w-4" /> Оставить заявку в Telegram
          </a>
          <a href="tel:+992000000000" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition hover:bg-card">
            <Phone className="h-4 w-4" /> +992 00 00 00 00
          </a>
        </div>
      </section>

      {/* Вакансии */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
          <Wrench className="h-5 w-5 text-primary" /> Открытые вакансии
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {vacancies.map((v) => (
            <div key={v.title} className="flex flex-col rounded-[28px] border border-border bg-card p-6 shadow-card">
              <h3 className="text-lg font-semibold text-foreground">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.city} · {v.type}</p>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{v.desc}</p>
              <a href="https://t.me/qashqay12" className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                Откликнуться
              </a>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Уже работаете мастером? Перейдите в <Link href="/master" className="font-medium text-primary hover:underline">кабинет мастера</Link>.
      </p>
    </main>
  );
}
