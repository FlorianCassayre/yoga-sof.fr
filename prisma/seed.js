const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...');
  const initialEmailsRaw = process.env.SEED_EMAILS_ADMIN;
  if(initialEmailsRaw) {
    const emails = initialEmailsRaw.split(',');
    await prisma.adminWhitelist.createMany({
      data: emails.map(email => ({ email })),
    });
    console.log(`Seeded ${emails.length} admin emails.`);
  } else {
    console.log('No data to seed, `SEED_EMAILS_ADMIN` is empty.');
  }
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
