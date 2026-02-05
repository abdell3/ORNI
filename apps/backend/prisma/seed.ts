import { EventStatus, PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_EVENT_MARKER = 'Concert Jazz';

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
  }

  const existingDemoEvent = await prisma.event.findFirst({
    where: { title: SEED_EVENT_MARKER },
  });

  if (!existingDemoEvent) {
    const now = new Date();

    await prisma.event.create({
      data: {
        title: SEED_EVENT_MARKER,
        description: 'Soirée jazz en plein air - démo seed',
        date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        location: 'Paris',
        capacity: 100,
        status: EventStatus.DRAFT,
      },
    });

    await prisma.event.create({
      data: {
        title: 'Conférence Tech 2025',
        description: 'Conférence annuelle sur les technologies émergentes',
        date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        location: 'Lyon',
        capacity: 200,
        status: EventStatus.PUBLISHED,
      },
    });

    await prisma.event.create({
      data: {
        title: 'Atelier Cuisine',
        description: 'Atelier découverte de la cuisine française',
        date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        location: 'Marseille',
        capacity: 20,
        status: EventStatus.PUBLISHED,
      },
    });

    await prisma.event.create({
      data: {
        title: 'Festival Annulé',
        description: 'Événement annulé pour tests',
        date: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
        location: 'Bordeaux',
        capacity: 500,
        status: EventStatus.CANCELED,
      },
    });
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
