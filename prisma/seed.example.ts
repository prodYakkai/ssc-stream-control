import { PrismaClient } from '@prisma/client';
import { config as initEnv } from 'dotenv';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
initEnv();
const prisma = new PrismaClient();

async function main() {

  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('Database already seeded');
    return;
  }

  if (!process.env.ADMIN_EMAIL) {
    console.error('ADMIN_EMAIL not set');
    return;
  }
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || '' },
    update: {},
    create: {
        email: process.env.ADMIN_EMAIL || '',
        thirdPartyId: '100000000000000000000',
        name: 'Admin User',
        admin: true,
        disabled: false
    }
  });

  const eventsCount = await prisma.event.count();
  if (eventsCount > 0) {
    console.log('Database already seeded');
    return;
  }

  const defaultEvent = await prisma.event.upsert({
    where: { id: '674aaaaa0d1e567bf931bae0'},
    update: {},
    create: {
      name: 'Default Event',
      description: 'This is the default event',
    }
  });

  const defaultEventBranding = await prisma.eventBranding.upsert({
    where: { id: '674aaaaa0d1e567bf931bae1'},
    update: {},
    create: {
      eventId: '674aaaaa0d1e567bf931bae0',
      
      primaryColor: '#000000',
      secondaryColor: '#ffffff',

      logoUrl: 'https://placehold.co/128',
      faviconUrl: 'https://placehold.co/128',
    }
  });

  const defaultCategory = await prisma.category.upsert({
    where: { id: '674aaaaa0d1e567bf931bae2'},
    update: {},
    create: {
      eventId: '674aaaaa0d1e567bf931bae0',
      name: 'default_category',
    }
  });
  console.log({ admin, defaultEvent, defaultEventBranding, defaultCategory });
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })