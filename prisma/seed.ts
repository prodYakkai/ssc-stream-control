import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'shen@blackcompany.tv'},
    update: {},
    create: {
        email: 'shen@blackcompany.tv',
        thirdPartyId: '100742731635280256742',
        name: 'Shen',
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