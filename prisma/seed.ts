import { PrismaClient } from "@prisma/client";
import { CITY_NAMES } from "../lib/types/domain";

const prisma = new PrismaClient();

async function main() {
  await prisma.city.createMany({
    data: CITY_NAMES.map((name, idx) => ({ id: `city_${idx + 1}`, name, timezone: "Europe/Bratislava" })),
    skipDuplicates: true
  });
}

main().finally(() => prisma.$disconnect());
