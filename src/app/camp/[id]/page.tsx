import { PrismaClient } from "@prisma/client";
import CampDetailClient from "@/app/components/CampDetailClient";

// Prisma client
const prisma = new PrismaClient();

export default async function CampDetail({ params }: { params: { id: string } }) {
  const { id } = params;

  const camp = await prisma.campSite.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!camp) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Camp not found</h1>
          <a href="/camp" className="text-green-600 underline">
            Back to Camp Sites
          </a>
        </div>
      </div>
    );
  }

  // ✅ Weather data
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
      const data = await res.json();

      if (data.list) {
        weatherData = data.list
          .filter((_item: any, idx: number) => idx % 8 === 0) // 每天取 1 条
          .slice(0, 5)
          .map((d: any) => {
            const rawDate = new Date(d.dt * 1000);
            const formattedDate = rawDate.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "numeric",
            });
            const description =
              d.weather[0].description.charAt(0).toUpperCase() +
              d.weather[0].description.slice(1);

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

  return <CampDetailClient camp={camp} weatherData={weatherData} />;
}
