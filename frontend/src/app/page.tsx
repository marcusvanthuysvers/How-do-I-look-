"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
        <div className="max-w-2xl text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
            How Do I{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Look?
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
            Try on clothes from any brand in the world &mdash; virtually. Upload
            your photo, pick your items, and see your perfect outfit before you
            buy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/upload")}
              className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-300"
            >
              Get Started
            </button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            {[
              "Any brand worldwide",
              "Realistic AI try-on",
              "Mix & match outfits",
              "Shoes & accessories",
            ].map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 bg-white/80 backdrop-blur border border-gray-200 rounded-full text-sm text-gray-600"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload Your Photo",
                desc: "Take a photo or upload one. Our guided capture helps you get the best results.",
              },
              {
                step: "2",
                title: "Pick Your Items",
                desc: "Paste product URLs, search by brand, or upload garment images from any brand.",
              },
              {
                step: "3",
                title: "See Your Look",
                desc: "Our AI generates a realistic image of you wearing the outfit. Download and share.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
