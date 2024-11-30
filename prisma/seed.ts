import { PrismaClient } from '@prisma/client';
import { config as initEnv } from 'dotenv';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
initEnv();
const prisma = new PrismaClient();

async function main() {
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
  })
  console.log({ admin })
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