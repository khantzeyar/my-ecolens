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

  const csvPath = path.join(__dirname, "CAMPING_WEST.csv");

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on("data", (row) => {
        let latitude = row.latitude ? parseFloat(row.latitude) : 0;
        let longitude = row.longitude ? parseFloat(row.longitude) : 0;

        // ✅ 修正 Kledang Saiong Forest Eco Park 的经纬度
        if (row.name?.trim() === "Kledang Saiong Forest Eco Park") {
          latitude = 4.6843;
          longitude = 101.0678;
        }

        results.push({
          type: row.type?.trim() || "",
          name: row.name?.trim() || "",
          latitude,
          longitude,
          state: row.state?.trim() || "",
          address: row.address?.trim() || "",
          phone: row.tel?.trim() || "",
          website: row.url?.trim() || "",
          openingTime: row.opening_hours?.trim() || "",
          fees: row.fee?.trim() || "",             // keep as String
          forestType: row.forest_type?.trim() || "",
          tags: row.attractions?.trim() || "",     // keep as String (frontend split later)
          contact: row.enquiries?.trim() || "",
          imageUrl:
            row.imageUrl && row.imageUrl.trim().length > 0
              ? row.imageUrl.trim()
              : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80", // fallback image
        });
      })
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`📥 Importing ${results.length} campsites...`);

  // Clear old data and insert new records
  await prisma.campSite.deleteMany();
  await prisma.campSite.createMany({
    data: results,
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
