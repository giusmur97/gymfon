import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.event.deleteMany();

  await prisma.product.createMany({
    data: Array.from({ length: 12 }).map((_, i) => ({
      title: `Prodotto ${i + 1}`,
      description: "Prodotto di esempio per Gym Fonty.",
      price: 4.99 + i,
      sku: `SKU-${i + 1}`,
      inventory: 100,
      category: "generico",
    })),
  });

  await prisma.service.createMany({
    data: [
      {
        title: "Allenamento e Alimentazione",
        shortDesc: "Percorso completo",
        longDesc: "Percorso completo con piani personalizzati.",
        priceOptions: { base: 129 },
        inclusions: { check: true },
      },
      {
        title: "Solo Allenamento",
        shortDesc: "Programma training",
        longDesc: "Programma di training su misura.",
        priceOptions: { base: 79 },
        inclusions: { check: false },
      },
    ],
  });

  await prisma.event.createMany({
    data: [
      { title: "Coaching Day Milano", city: "Milano", venue: "Centro 1", date: new Date(Date.now() + 7*86400000), capacity: 30 },
      { title: "Coaching Day Roma", city: "Roma", venue: "Centro 2", date: new Date(Date.now() + 14*86400000), capacity: 40 },
    ],
  });

  console.log("Seed completed");
}

main().finally(() => prisma.$disconnect());
