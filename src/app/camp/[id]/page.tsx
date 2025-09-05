import { PrismaClient } from "@prisma/client";
import Link from "next/link";

// Extend global type for Prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Singleton Prisma client
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// Updated interface to match Next.js App Router expectations
interface CampDetailProps {
  params: Promise<{ id: string }>;
}

export default async function CampDetail({ params }: CampDetailProps) {
  // Await the params since it's now a Promise
  const { id } = await params;

  const camp = await prisma.campSite.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!camp) {
    return <div className="p-6 text-red-600">Camp not found</div>;
  }

  return (
    <main className="pt-24 p-6 max-w-5xl mx-auto">
      <Link href="/camp" className="text-green-600 underline mb-4 block">
        ← Back to Map
      </Link>

      <h1 className="text-4xl font-bold mb-4">{camp.name}</h1>
      <p className="text-lg text-gray-600 mb-6">{camp.type}</p>

      <div className="mb-6">
        {camp.imageUrl ? (
          <img
            src={camp.imageUrl}
            alt={camp.name}
            className="rounded-lg shadow-md w-full max-h-[400px] object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            No image available
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </main>
  );
}