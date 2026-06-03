# TajFix

Modern home appliance repair and electronics marketplace built with Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and NextAuth.

## Features

- Услуги по ремонту бытовой техники
- Магазин техники и электроники
- Быстрый AI-помощник для диагностики проблем
- Личный кабинет и заказы
- Админ-панель для управления товарами, услугами, мастерами и пользователями

## Быстрый старт

1. Установите зависимости:
   ```bash
   npm install
   ```
2. Скопируйте файл окружения:
   ```bash
   cp .env.example .env
   ```
3. Настройте `DATABASE_URL` в `.env`
4. Сгенерируйте Prisma Client и примените миграции:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
5. Запустите локально:
   ```bash
   npm run dev
   ```

## Команды

- `npm run dev` — запуск приложения
- `npm run build` — сборка
- `npm run start` — запуск собранного приложения
- `npm run lint` — проверка ESLint
- `npm run prisma:generate` — генерация Prisma Client
- `npm run prisma:migrate` — миграция базы данных
- `npm run seed` — наполнение демо-данными

## Демо-аккаунты

После выполнения `npx prisma db seed`:

- **Администратор:** `admin@tajfix.local` / `tajfix2026`
- **Пользователь:** `user@tajfix.local` / `tajfix2026`

## Примечания

- В качестве `NEXTAUTH_SECRET` используйте случайную строку (например, `openssl rand -base64 32`).
- Аутентификация реализована на NextAuth (Credentials) со стратегией JWT, пароли хешируются через `bcryptjs`.
- Роль администратора задаётся в seed-скрипте (`prisma/seed.ts`).
- Страницы и API, работающие с базой, помечены `export const dynamic = 'force-dynamic'`, поэтому для `npm run build` живая база данных не требуется — она нужна только во время работы приложения.

## Развёртывание на Vercel

1. Создайте проект на Vercel и подключите репозиторий `islomiddin1221/projekt`.
2. В настройках проекта установите команду сборки:
   ```bash
   npm run build
   ```
3. Оставьте `Output Directory` пустым для стандартного Next.js.
4. Добавьте переменные окружения в Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
5. После развертывания приложение запустится автоматически.

> Для локальной разработки можно использовать файл `.env` на основе `.env.example`.
