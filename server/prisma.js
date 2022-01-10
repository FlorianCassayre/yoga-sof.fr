import { PrismaClient } from '@prisma/client'

// From: https://flaviocopes.com/nextjs-fix-prismaclient-unable-run-browser/

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export { prisma };
