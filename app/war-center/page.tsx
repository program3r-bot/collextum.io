import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const collections = [
  {
    id: 1,
    title: "Jurassic Park",
    year: 1993,
    genre: "Action / Adventure",
    description:
      "Collectibles from the iconic Steven Spielberg film featuring dinosaurs brought back to life through genetic engineering.",
    items: 42,
    imageColor: "from-green-700 to-green-900",
    accentColor: "text-green-400",
  },
];

export default function WarCenter() {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">War Center</h1>
          <p className="text-xl text-gray-400">
            Explore curated collections from the greatest battle and adventure
            franchises of all time.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Card Header with gradient */}
              <div
                className={`h-40 bg-gradient-to-br ${collection.imageColor} flex items-center justify-center`}
              >
                <span className="text-white text-5xl font-black opacity-30 select-none">
                  {collection.title.charAt(0)}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-bold text-white">
                    {collection.title}
                  </h2>
                  <span className="text-sm text-gray-400 ml-2 mt-1 whitespace-nowrap">
                    {collection.year}
                  </span>
                </div>

                <p className={`text-sm font-medium mb-3 ${collection.accentColor}`}>
                  {collection.genre}
                </p>

                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {collection.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-gray-500 text-sm">
                    {collection.items} items
                  </span>
                  <button
                    disabled
                    className="text-sm font-medium text-gray-500 bg-gray-700 px-4 py-2 rounded-lg cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
