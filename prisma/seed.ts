import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const results: any[] = [];

  fs.createReadStream(path.join(__dirname, "CAMPING_WEST_MINIMAL.csv"))
    .pipe(csvParser())
    .on("data", (row) => {
      const match = row.location.match(/N([\d\.]+).*E\s*([\d\.]+)/);
      const latitude = match ? parseFloat(match[1]) : null;
      const longitude = match ? parseFloat(match[2]) : null;

      results.push({
        type: row.type.trim(),
        name: row.name.trim(),
        latitude,
        longitude,
        state: row.state.trim(),
      });
    })
    .on("end", async () => {
      console.log(`Importing ${results.length} campsites...`);

      for (const site of results) {
        await prisma.campSite.create({ data: site });
      }

      console.log("Seeding completed!");
      await prisma.$disconnect();
    });
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
