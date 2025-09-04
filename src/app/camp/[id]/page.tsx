import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function CampDetail({
  params,
}: {
  params: { id: string };
}) {
  const camp = await prisma.campSite.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!camp) {
    return <div className="p-6 text-red-600">Camp not found</div>;
  }

  return (
    <main className="pt-24 p-6 max-w-5xl mx-auto">
      {/* Back button */}
      <Link href="/camp" className="text-green-600 underline mb-4 block">
        ← Back to Map
      </Link>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">{camp.name}</h1>
      <p className="text-lg text-gray-600 mb-6">{camp.type}</p>

      {/* Image */}
      <div className="mb-6">
        {camp.image ? (
          <img
            src={camp.image}
            alt={camp.name}
            className="rounded-lg shadow-md w-full max-h-[400px] object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            No image available
          </div>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location */}
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Location</h2>
          <p className="text-gray-700">{camp.state}</p>
          <p className="text-gray-500 text-sm mt-1">{camp.address}</p>
        </div>

        {/* Contact */}
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p className="text-gray-700">Tel: {camp.phone || "N/A"}</p>
          <p className="text-gray-700">Email: {camp.contact || "N/A"}</p>
          {camp.website && (
            <a
              href={camp.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 underline mt-2 block"
            >
              Go to Website
            </a>
          )}
        </div>

        {/* Fees */}
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Entry Fee</h2>
          {camp.fees.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700">
              {camp.fees.map((fee, idx) => (
                <li key={idx}>{fee}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Free / Not specified</p>
          )}
        </div>

        {/* Opening Time */}
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-2">Opening Hours</h2>
          <p className="text-gray-700">
            {camp.openingTime || "Not available"}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="mt-6 p-4 border rounded-lg shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="text-gray-700 whitespace-pre-line">
          {camp.description || "No description available"}
        </p>
      </div>

      {/* Tags */}
      {camp.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {camp.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </main>
  );
}
