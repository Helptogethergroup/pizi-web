// Seed is disabled — we use real Hostinger data
// This is a placeholder. Run only manually if needed.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed disabled — using real Hostinger data.');
  console.log('Use existing users from your imported database:');
  console.log('  admin@pgfind.in (admin)');
  console.log('  owner@pgfind.in (owner)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
