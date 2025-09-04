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

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, "CAMPING_WEST.csv"))
      .pipe(csvParser())
      .on("data", (row) => {
        // Parse latitude & longitude
        const latitude = row.latitude ? parseFloat(row.latitude) : 0;
        const longitude = row.longitude ? parseFloat(row.longitude) : 0;

        results.push({
          type: row.type?.trim() || "",
          name: row.name?.trim() || "",
          latitude,
          longitude,
          state: row.state?.trim() || "",
          address: row.address?.trim() || "",
          phone: row.tel?.trim() || "",
          website: row.url?.trim() || "",
          description: row.information?.trim() || "",
          openingTime: row.opening_hours?.trim() || "",
          fees: row.fee ? [row.fee.trim()] : [],
          tags: row.attractions
            ? row.attractions.split(",").map((t: string) => t.trim())
            : [],
          contact: row.enquiries?.trim() || "",
          image:
            row.image && row.image.trim().length > 0
              ? row.image.trim()
              : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80", // ✅ 默认森林图
        });
      })
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Importing ${results.length} campsites...`);

  // Clear old data and insert new records
  await prisma.campSite.deleteMany();
  await prisma.campSite.createMany({
    data: results,
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error while seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
