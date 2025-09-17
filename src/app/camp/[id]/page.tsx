import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import WeatherCard from "@/app/components/WeatherCard"; // Weather component

// Extend global type for Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Singleton Prisma client
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

interface CampDetailProps {
  params: Promise<{ id: string }>;
}

type WeatherApiResponse = {
  list: {
    dt: number;
    main: { temp: number };
    weather: { description: string; icon: string }[];
  }[];
};

export default async function CampDetail({ params }: CampDetailProps) {
  const { id } = await params;

  const camp = await prisma.campSite.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!camp) {
    return <div className="p-6 text-red-600">Camp not found</div>;
  }

  // ✅ Weather data with explicit type
  let weatherData: {
    date: string;
    temp: number;
    description: string;
    icon: string;
  }[] = [];

  try {
    if (camp.latitude && camp.longitude) {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_KEY;
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${camp.latitude}&lon=${camp.longitude}&appid=${API_KEY}&units=metric`
      );
      const data: WeatherApiResponse = await res.json();

      if (data.list) {
        weatherData = data.list
          .filter((_item, idx) => idx % 8 === 0) // one per day
          .slice(0, 5)
          .map((d) => {
            const rawDate = new Date(d.dt * 1000);
            const formattedDate = rawDate.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "numeric",
            }); // ✅ DD/MM format
            const description =
              d.weather[0].description.charAt(0).toUpperCase() +
              d.weather[0].description.slice(1); // ✅ Capitalize

            return {
              date: formattedDate,
              temp: d.main.temp,
              description,
              icon: d.weather[0].icon,
            };
          });
      }
    }
  } catch (err) {
    console.error("Failed to fetch weather:", err);
  }

  return (
    <main className="pt-24 p-6 max-w-6xl mx-auto">
      <Link href="/camp" className="text-green-600 underline mb-4 block">
        ← Back to Map
      </Link>

      <h1 className="text-4xl font-bold mb-4">{camp.name}</h1>
      <p className="text-lg text-gray-600 mb-6">{camp.type}</p>

      {/* Image + Details in grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Image */}
        <div>
          {camp.imageUrl ? (
            <Image
              src={camp.imageUrl}
              alt={camp.name}
              width={800}
              height={400}
              className="rounded-lg shadow-md w-full max-h-[400px] object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              No image available
            </div>
          )}
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-2">Location</h2>
            <p className="text-gray-700">{camp.state}</p>
            <p className="text-gray-500 text-sm mt-1">{camp.address}</p>
          </div>

          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-2">Contact</h2>
            <p className="text-gray-700">Tel: {camp.phone || "N/A"}</p>
          </div>

          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-2">Entry Fee</h2>
            {camp.fees ? (
              <div className="space-y-2 text-gray-700">
                {camp.fees
                  .split(/[,|]/)
                  .map((fee) => fee.trim())
                  .filter(Boolean)
                  .map((fee, idx) => {
                    const isHeader = /(citizen|admission)/i.test(fee);
                    return (
                      <p
                        key={idx}
                        className={
                          isHeader
                            ? "text-lg font-semibold text-gray-900 mt-2"
                            : "pl-4 text-gray-700"
                        }
                      >
                        {fee}
                      </p>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500">Free / Not specified</p>
            )}
          </div>

          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-2">Opening Hours</h2>
            <p className="text-gray-700">{camp.openingTime || "Not available"}</p>
          </div>
        </div>
      </div>

      {/* Tags */}
      {camp.tags && (
        <div className="mt-6 flex flex-wrap gap-2">
          {camp.tags.split(",").map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
            >
              {tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Weather forecast */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Weather Forecast</h2>
        {weatherData.length > 0 ? (
          <WeatherCard weather={weatherData} />
        ) : (
          <p className="text-gray-600">Weather data not available</p>
        )}
      </div>

      {/* ✅ Guide Button */}
      <div className="mt-12 text-center">
        <Link
          href="/guide"
          className="inline-block px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow hover:bg-green-700 transition"
        >
          Go to Camping Guide
        </Link>
      </div>
    </main>
  );
}
