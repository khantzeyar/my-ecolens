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
        let latitude = row.latitude ? parseFloat(row.latitude) : null;
        let longitude = row.longitude ? parseFloat(row.longitude) : null;

        const name = row.name?.trim() || "";
        const normalizedName = name.toLowerCase();

        // ✅ Fix wrong longitude (force to East, positive value)
        if (longitude !== null && longitude < 0) {
          longitude = Math.abs(longitude);
        }

        // ✅ Manual correction: Kledang Saiong
        if (normalizedName === "kledang saiong forest eco park") {
          latitude = 4.6843;
          longitude = 101.0678;
        }

        // ✅ Manual correction: Bukit Batu Lebah
        if (normalizedName === "bukit batu lebah forest eco park") {
          latitude = 2.3987;
          longitude = 102.4286;
        }

        // ✅ Fallback (avoid Africa 0,0)
        if (latitude === null || longitude === null) {
          latitude = 4.2105;     // Malaysia approx latitude
          longitude = 101.9758; // Malaysia approx longitude
        }

        results.push({
          type: row.type?.trim() || "",
          name,
          latitude,
          longitude,
          state: row.state?.trim() || "",
          address: row.address?.trim() || "",
          phone: row.tel?.trim() || "",
          website: row.url?.trim() || "",
          openingTime: row.opening_hours?.trim() || "",
          fees: row.fee?.trim() || "",
          forestType: row.forest_type?.trim() || "",
          tags: row.attractions?.trim() || "",
          contact: row.enquiries?.trim() || "",
          imageUrl:
            row.imageUrl && row.imageUrl.trim().length > 0
              ? row.imageUrl.trim()
              : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
        });
      })
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`📥 Importing ${results.length} campsites...`);

  // ✅ Clear DB and re-insert corrected data
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