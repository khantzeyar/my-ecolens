"use client";

import Image from "next/image";

export default function WhyPage() {
  return (
    <main
      className="pt-40 min-h-screen bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forest-banner.jpg')" }}
    >
      {/* Header */}
      <section className="text-center max-w-4xl mx-auto px-6 mb-20">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent drop-shadow-lg">
          Why Responsible Camping Matters
        </h1>
        <p className="mt-6 text-lg text-gray-700 leading-relaxed">
          Forests are more than just trees — they regulate our climate, protect biodiversity,
          and provide a safe haven for future generations. Camping responsibly ensures
          that we enjoy nature today without destroying it for tomorrow.
        </p>
      </section>

      {/* Wildlife Section */}
      <section className="max-w-5xl mx-auto px-6 mb-28">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-10">
          Wildlife at Risk
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              img: "/images/hornbill.jpg",
              alt: "Hornbill",
              title: "Hornbill",
              desc: "These iconic birds lose nesting trees due to deforestation.",
            },
            {
              img: "/images/tiger.jpg",
              alt: "Tiger",
              title: "Tiger",
              desc: "Habitat loss pushes tigers closer to extinction in Malaysia.",
            },
            {
              img: "/images/rafflesia.jpg",
              alt: "Rafflesia",
              title: "Rafflesia",
              desc: "Rare plants like Rafflesia are endangered by irresponsible camping.",
            },
          ].map((w) => (
            <div key={w.title} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <Image
                src={w.img}
                alt={w.alt}
                width={500}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{w.title}</h3>
                <p className="text-gray-600">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Facts Section */}
      <section className="bg-yellow-50 border border-yellow-200 rounded-2xl shadow-xl max-w-4xl mx-auto px-8 py-10 mb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          The Impact of Irresponsible Camping
        </h2>
        <ul className="list-disc list-inside space-y-3 text-gray-700">
          <li>
            Malaysia lost over <b>8.6% of tree cover</b> between 2001–2023
            (Global Forest Watch).
          </li>
          <li>Wildlife such as hornbills and tigers lose their natural habitat.</li>
          <li>Improper waste disposal pollutes rivers and attracts pests.</li>
          <li>Uncontrolled campfires can cause forest fires.</li>
        </ul>
      </section>

      {/* Comparison Section - moved here */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-6 mb-28">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Image
            src="/images/forest-fallback.png"
            alt="Healthy Forest"
            width={800}
            height={500}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-bold text-green-700 mb-2">Healthy Forest</h3>
            <p className="text-gray-600">
              Rich biodiversity, clean rivers, and safe habitats for wildlife.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Image
            src="/images/deforested-land.jpg"
            alt="Deforested Area"
            width={800}
            height={500}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-bold text-red-600 mb-2">Deforested Area</h3>
            <p className="text-gray-600">
              Soil erosion, loss of wildlife, and increased carbon emissions.
            </p>
          </div>
        </div>
      </section>

      {/* Explore More Data */}
      <section className="text-center max-w-3xl mx-auto px-6 mb-28">
        <h2 className="text-3xl font-bold text-green-700 mb-4">
          Want to See the Data?
        </h2>
        <p className="text-gray-700 mb-8">
          Explore interactive charts and maps to understand how Malaysia’s forests are changing,
          from 2001 until future projections in 2030.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <a
            href="/insights"
            className="bg-white text-green-700 border border-green-600 px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-50"
          >
            See More Data →
          </a>
          <a
            href="/guide"
            className="text-green-700 underline hover:text-green-900 font-semibold"
          >
            How to Camp Responsibly →
          </a>
        </div>
      </section>
    </main>
  );
}
