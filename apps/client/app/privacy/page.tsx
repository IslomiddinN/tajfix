import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Политика конфиденциальности — TajFix',
  description: 'Как TajFix обрабатывает и защищает персональные данные пользователей.'
};

const sections = [
  {
    title: '1. Какие данные мы собираем',
    body: 'Имя, номер телефона, email и адрес доставки, которые вы указываете при регистрации и оформлении заказов или заявок на ремонт. Пароль хранится только в виде защищённого хеша (bcrypt) — мы не видим его в открытом виде.'
  },
  {
    title: '2. Зачем нам эти данные',
    body: 'Для обработки заказов магазина и заявок на ремонт, связи с вами по статусу заказа, доставки техники и выезда мастера, а также для улучшения качества сервиса.'
  },
  {
    title: '3. Оплата',
    body: 'Основной способ оплаты — наличными при получении (COD). Мы не храним и не обрабатываем данные банковских карт.'
  },
  {
    title: '4. Передача данных третьим лицам',
    body: 'Мы передаём минимально необходимые данные (имя, телефон, адрес) только мастеру или курьеру, выполняющему ваш заказ. Мы не продаём ваши данные и не передаём их в рекламных целях.'
  },
  {
    title: '5. Хранение и защита',
    body: 'Данные хранятся в защищённой базе данных с ограниченным доступом. Доступ к управлению данными есть только у администратора сервиса. Сессии защищены через JWT-токены.'
  },
  {
    title: '6. Ваши права',
    body: 'Вы можете запросить изменение или удаление своих данных, связавшись с нами по телефону +992 44 600 00 00 или по email hello@tajfix.pro.'
  }
];

export default function PrivacyPage() {
  return (
    <main className="container py-6 sm:py-10">
      <div className="mb-6 flex items-center gap-3 sm:mb-8">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-500/15 text-green-600 dark:text-green-400">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Политика конфиденциальности</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">Мы бережно относимся к вашим персональным данным.</p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {sections.map((s) => (
          <section key={s.title} className="rounded-[24px] border border-border bg-card p-5 shadow-card sm:rounded-[28px] sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">{s.title}</h2>
            <p className="mt-2 leading-7 text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
