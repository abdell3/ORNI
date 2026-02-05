import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@orni.local';
  const participantEmail = 'participant@orni.local';

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const participantPassword = await bcrypt.hash('Participant123!', 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: adminPassword,
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'ORNI',
      },
    });

    console.log('Admin créé');
  } else {
    console.log('Admin existe déjà');
  }

  const existingParticipant = await prisma.user.findUnique({
    where: { email: participantEmail },
  });

  if (!existingParticipant) {
    await prisma.user.create({
      data: {
        email: participantEmail,
        password: participantPassword,
        role: UserRole.PARTICIPANT,
        firstName: 'Participant',
        lastName: 'ORNI',
      },
    });

    console.log('Participant créé');
  } else {
    console.log('Participant existe déjà');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
