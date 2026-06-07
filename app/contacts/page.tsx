import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';

export const metadata = {
  title: 'Контакты — TajFix',
  description: 'Как нас найти: адрес, телефон, часы работы.'
};

export default function ContactsPage() {
  return (
    <main className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Как нас найти</h1>
        <p className="mt-2 text-muted-foreground">Свяжитесь с нами любым удобным способом — мы на связи каждый день.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-4 rounded-[28px] border border-border bg-card p-6 shadow-card">
          <MapPin className="h-6 w-6 text-brand" />
          <div>
            <p className="font-semibold text-foreground">Адрес</p>
            <p className="mt-1 text-muted-foreground">г. Душанбе, проспект Рудаки, 25</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-[28px] border border-border bg-card p-6 shadow-card">
          <Phone className="h-6 w-6 text-brand" />
          <div>
            <p className="font-semibold text-foreground">Телефон</p>
            <a href="tel:+992000000000" className="mt-1 block text-muted-foreground hover:text-foreground">+992 00 00 00 00</a>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-[28px] border border-border bg-card p-6 shadow-card">
          <Mail className="h-6 w-6 text-brand" />
          <div>
            <p className="font-semibold text-foreground">Email</p>
            <a href="mailto:hello@tajfix.tj" className="mt-1 block text-muted-foreground hover:text-foreground">hello@tajfix.tj</a>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-[28px] border border-border bg-card p-6 shadow-card">
          <Clock className="h-6 w-6 text-brand" />
          <div>
            <p className="font-semibold text-foreground">Часы работы</p>
            <p className="mt-1 text-muted-foreground">Ежедневно, 08:00 – 22:00</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-[28px] border border-border bg-secondary p-8 text-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold">Нужен срочный ремонт?</p>
          <p className="mt-1 text-sm text-muted-foreground">Напишите нам в Telegram — ответим за пару минут.</p>
        </div>
        <a href="https://t.me/qashqay12" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand/90">
          <Send className="h-4 w-4" /> Написать в Telegram
        </a>
      </div>
    </main>
  );
}
