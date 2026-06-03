import bcrypt from 'bcryptjs';
import { PrismaClient, Role, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('tajfix2026', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tajfix.local' },
    update: {},
    create: {
      name: 'Админ TajFix',
      email: 'admin@tajfix.local',
      phone: '+992900000001',
      passwordHash,
      role: Role.ADMIN
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@tajfix.local' },
    update: {},
    create: {
      name: 'Далер',
      email: 'user@tajfix.local',
      phone: '+992900000002',
      passwordHash,
      role: Role.USER
    }
  });

  const categories = await prisma.category.createMany({
    data: [
      { name: 'Стиральная машина', slug: 'washing-machine', type: CategoryType.SERVICE, icon: 'WashingMachine' },
      { name: 'Холодильник', slug: 'fridge', type: CategoryType.SERVICE, icon: 'Fridge' },
      { name: 'Кондиционер', slug: 'air-conditioner', type: CategoryType.SERVICE, icon: 'AirConditioner' },
      { name: 'Телевизор', slug: 'tv', type: CategoryType.SERVICE, icon: 'Tv' },
      { name: 'Посудомоечная машина', slug: 'dishwasher', type: CategoryType.SERVICE, icon: 'Dishwasher' },
      { name: 'Мелкая техника', slug: 'small-appliances', type: CategoryType.SERVICE, icon: 'Plug' },
      { name: 'Стиральные машины', slug: 'washers', type: CategoryType.PRODUCT, icon: 'WashingMachine' },
      { name: 'Холодильники', slug: 'refrigerators', type: CategoryType.PRODUCT, icon: 'Fridge' },
      { name: 'Кондиционеры', slug: 'conditioners', type: CategoryType.PRODUCT, icon: 'AirConditioner' },
      { name: 'Телевизоры', slug: 'televisions', type: CategoryType.PRODUCT, icon: 'Tv' },
      { name: 'Посудомоечные машины', slug: 'dishwashers', type: CategoryType.PRODUCT, icon: 'Dishwasher' },
      { name: 'Роботы и уборка', slug: 'cleaning', type: CategoryType.PRODUCT, icon: 'Robot' }
    ],
    skipDuplicates: true
  });

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((category) => [category.slug, category])
  );

  await prisma.service.createMany({
    data: [
      {
        title: 'Ремонт стиральной машины',
        slug: 'washing-machine-repair',
        description: 'Диагностика и ремонт стиральных машин любых брендов.',
        priceFrom: 150,
        categoryId: categoryMap['washing-machine'].id,
        imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80',
        isUrgentAvailable: true
      },
      {
        title: 'Ремонт холодильника',
        slug: 'fridge-repair',
        description: 'Починка морозильного и холодильного отделения.',
        priceFrom: 200,
        categoryId: categoryMap['fridge'].id,
        imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
        isUrgentAvailable: true
      },
      {
        title: 'Установка кондиционера',
        slug: 'ac-installation',
        description: 'Монтаж и наладка сплит-систем в квартире или офисе.',
        priceFrom: 250,
        categoryId: categoryMap['air-conditioner'].id,
        imageUrl: 'https://images.unsplash.com/photo-1635048424329-a9bfb146d7aa?auto=format&fit=crop&w=800&q=80',
        isUrgentAvailable: false
      },
      {
        title: 'Ремонт телевизора',
        slug: 'tv-repair',
        description: 'Профессиональная диагностика и замена деталей телевизоров.',
        priceFrom: 180,
        categoryId: categoryMap['tv'].id,
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
        isUrgentAvailable: true
      },
      {
        title: 'Ремонт посудомоечной машины',
        slug: 'dishwasher-repair',
        description: 'Чистка, ремонт насосов и датчиков посудомоек.',
        priceFrom: 220,
        categoryId: categoryMap['dishwasher'].id,
        imageUrl: 'https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?auto=format&fit=crop&w=800&q=80',
        isUrgentAvailable: false
      }
    ],
    skipDuplicates: true
  });

  await prisma.product.createMany({
    data: [
      {
        title: 'Samsung WW70 Eco Bubble 7 кг',
        slug: 'samsung-ww70-eco-bubble',
        description: 'Надежная стиральная машина с экономным режимом и быстрой стиркой.',
        brand: 'Samsung',
        categoryId: categoryMap['washers'].id,
        price: 4290,
        oldPrice: 4690,
        discountPercent: 9,
        imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        stock: 12,
        isHit: true,
        isNew: false
      },
      {
        title: 'LG GN-B422 No Frost 384 л',
        slug: 'lg-gn-b422',
        description: 'Холодильник с технологией No Frost и большим объемом.',
        brand: 'LG',
        categoryId: categoryMap['refrigerators'].id,
        price: 8990,
        oldPrice: 9490,
        discountPercent: 5,
        imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        stock: 8,
        isHit: true,
        isNew: true
      },
      {
        title: 'Gree Pular 12 Inverter',
        slug: 'gree-pular-12',
        description: 'Инверторный кондиционер с тихой работой и быстрым охлаждением.',
        brand: 'Gree',
        categoryId: categoryMap['conditioners'].id,
        price: 5450,
        oldPrice: 5900,
        discountPercent: 8,
        imageUrl: 'https://images.unsplash.com/photo-1635048424329-a9bfb146d7aa?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        stock: 6,
        isHit: true,
        isNew: false
      },
      {
        title: 'Xiaomi TV A2 50"',
        slug: 'xiaomi-tv-a2-50',
        description: 'Умный телевизор с четкой картинкой и приложениями для дома.',
        brand: 'Xiaomi',
        categoryId: categoryMap['televisions'].id,
        price: 3990,
        oldPrice: 4290,
        discountPercent: 7,
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        stock: 10,
        isHit: true,
        isNew: true
      },
      {
        title: 'Bosch Serie 4 Посудомоечная',
        slug: 'bosch-serie-4-dishwasher',
        description: 'Стабильная посудомойка с функцией быстрой мойки и экономией воды.',
        brand: 'Bosch',
        categoryId: categoryMap['dishwashers'].id,
        price: 6790,
        oldPrice: 7290,
        discountPercent: 7,
        imageUrl: 'https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        stock: 5,
        isHit: false,
        isNew: false
      },
      {
        title: 'Xiaomi Robot Vacuum S10',
        slug: 'xiaomi-robot-vacuum-s10',
        description: 'Робот-пылесос с влажной уборкой и картографированием помещений.',
        brand: 'Xiaomi',
        categoryId: categoryMap['cleaning'].id,
        price: 2890,
        oldPrice: 3190,
        discountPercent: 9,
        imageUrl: 'https://images.unsplash.com/photo-1620283085439-39620a1e21c4?auto=format&fit=crop&w=800&q=80',
        rating: 4.6,
        stock: 14,
        isHit: false,
        isNew: true
      }
    ],
    skipDuplicates: true
  });

  await prisma.master.createMany({
    data: [
      {
        name: 'Сорбон Ҳакимов',
        phone: '+992900111222',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        specialization: 'мастер на все руки',
        description: 'Оперативная помощь по ремонту любой техники.',
        rating: 5.0,
        reviewsCount: 78,
        distanceKm: 1.2,
        priceFrom: 150,
        guaranteeText: 'Гарантия 30 дней на работу',
        isAvailable: true
      },
      {
        name: 'Алишер Раҳимов',
        phone: '+992900333444',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        specialization: 'стиральные машины',
        description: 'Опытный специалист по стиральной технике.',
        rating: 4.9,
        reviewsCount: 54,
        distanceKm: 2.4,
        priceFrom: 160,
        guaranteeText: 'Гарантия 45 дней на запчасти',
        isAvailable: true
      },
      {
        name: 'Парвиз Юсуфов',
        phone: '+992900555666',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        specialization: 'кондиционеры',
        description: 'Мастер установки и ремонта климатической техники.',
        rating: 4.9,
        reviewsCount: 62,
        distanceKm: 3.1,
        priceFrom: 250,
        guaranteeText: 'Гарантия 30 дней на монтаж',
        isAvailable: true
      },
      {
        name: 'Фарход Назаров',
        phone: '+992900777888',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        specialization: 'холодильники',
        description: 'Профессиональный ремонт систем охлаждения.',
        rating: 4.8,
        reviewsCount: 49,
        distanceKm: 1.8,
        priceFrom: 200,
        guaranteeText: 'Гарантия 30 дней на замену деталей',
        isAvailable: true
      }
    ],
    skipDuplicates: true
  });

  // Link a master profile to a login account so the master dashboard is testable.
  const masterUser = await prisma.user.upsert({
    where: { email: 'master@tajfix.local' },
    update: { role: Role.MASTER },
    create: {
      name: 'Сорбон Ҳакимов',
      email: 'master@tajfix.local',
      phone: '+992900111222',
      passwordHash,
      role: Role.MASTER
    }
  });

  const masterProfile = await prisma.master.findFirst({ where: { name: 'Сорбон Ҳакимов' } });
  if (masterProfile && masterProfile.userId !== masterUser.id) {
    await prisma.master.update({ where: { id: masterProfile.id }, data: { userId: masterUser.id } });
  }

  // Demo booking assigned to the linked master so the dashboard is not empty.
  const demoService = await prisma.service.findUnique({ where: { slug: 'washing-machine-repair' } });
  if (masterProfile && demoService) {
    const existingBooking = await prisma.repairBooking.findFirst({
      where: { masterId: masterProfile.id, userId: user.id }
    });
    if (!existingBooking) {
      await prisma.repairBooking.create({
        data: {
          userId: user.id,
          serviceId: demoService.id,
          masterId: masterProfile.id,
          problemText: 'Стиральная машина стучит при отжиме и не сливает воду.',
          address: 'г. Душанбе, ул. Рудаки 25, кв. 12',
          phone: '+992900000002',
          preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          estimatedPrice: 250,
          status: 'NEW'
        }
      });
    }
  }

  console.log(`Seed completed. Admin: ${admin.email} / tajfix2026 · Demo user: ${user.email} / tajfix2026 · Master: ${masterUser.email} / tajfix2026`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
