import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const sites = [
  { name: "Portfolio", url: "https://joechamdani.com", order: 1 },
  {
    name: "Dashboard",
    url: "https://dashboard.joechamdani.com",
    order: 2,
  },
  { name: "UW Portfolio", url: "https://uw.joechamdani.com", order: 3 },
  {
    name: "Transfer Tool",
    url: "https://transfer.joechamdani.cloud",
    order: 4,
  },
  { name: "INFO 340", url: "https://info340.joechamdani.com", order: 5 },
  { name: "INFO 200", url: "https://info200.joechamdani.cloud", order: 6 },
];

async function main() {
  for (const site of sites) {
    await prisma.site.upsert({
      where: { url: site.url },
      update: { name: site.name, order: site.order },
      create: site,
    });
  }
  console.log(`Seeded ${sites.length} sites`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
