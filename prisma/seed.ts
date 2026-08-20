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
  {
    name: "Portfolio",
    url: "https://joechamdani.com",
    group: "Personal",
    order: 1,
    active: true,
  },
  {
    // Private, monitored from the personal dashboard instead. Kept inactive
    // here so the public status page never shows it.
    name: "Dashboard",
    url: "https://dashboard.joechamdani.com",
    group: "Personal",
    order: 2,
    active: false,
  },
  {
    name: "Freelance",
    url: "https://freelance.joechamdani.com",
    group: "Personal",
    order: 2,
    active: true,
  },
  {
    name: "CDN",
    url: "https://cdn.joechamdani.com",
    group: "Personal",
    order: 3,
    active: true,
  },
  {
    name: "Analytics",
    url: "https://analytics.joechamdani.com",
    group: "Personal",
    order: 4,
    active: true,
  },
  {
    name: "UW Portfolio",
    url: "https://uw.joechamdani.com",
    group: "UW Projects",
    order: 3,
    active: true,
  },
  {
    name: "Transfer Tool",
    url: "https://transfer.joechamdani.cloud",
    group: "UW Projects",
    order: 4,
    active: true,
  },
  {
    name: "INFO 340",
    url: "https://info340.joechamdani.com",
    group: "UW Projects",
    order: 5,
    active: true,
  },
  {
    name: "INFO 200",
    url: "https://info200.joechamdani.cloud",
    group: "UW Projects",
    order: 6,
    active: true,
  },
  {
    name: "INFO 360",
    url: "https://info360.joechamdani.com",
    group: "UW Projects",
    order: 10,
    active: true,
  },
  {
    name: "INFO 380",
    url: "https://info380.joechamdani.com/",
    group: "UW Projects",
    order: 11,
    active: true,
  },
];

async function main() {
  for (const site of sites) {
    await prisma.site.upsert({
      where: { url: site.url },
      update: {
        name: site.name,
        group: site.group,
        order: site.order,
        active: site.active,
      },
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
