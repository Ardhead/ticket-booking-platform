import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  let event = await prisma.event.findFirst({ where: { name: 'Summer Concert 2026' } });

  if (!event) {
    event = await prisma.event.create({
      data: {
        name: 'Summer Concert 2026',
        startsAt: new Date('2026-07-15T20:00:00Z'),
      },
    });
  }

  const existingSeats = await prisma.seat.count({ where: { eventId: event.id } });
  if (existingSeats > 0) {
    console.log(`Event "${event.name}" already has ${existingSeats} seats, skipping`);
    return;
  }

  const seats: { eventId: string; rowLabel: string; seatNumber: number }[] = [];
  for (const row of ['A', 'B', 'C', 'D', 'E']) {
    for (let num = 1; num <= 10; num++) {
      seats.push({ eventId: event.id, rowLabel: row, seatNumber: num });
    }
  }

  await prisma.seat.createMany({ data: seats });
  console.log(`Seeded event "${event.name}" with ${seats.length} seats`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
