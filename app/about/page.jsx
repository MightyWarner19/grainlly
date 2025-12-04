import React from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import CustomerReviews from "@/components/CustomerReviews";

export const metadata = {
  title: "About | Grainlly E-Commerce",
  description: "Learn more about Grainlly.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="px-6 md:px-16 lg:px-32 py-12 bg-[#FBFAF9]">
        {/* Hero */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="mt-4 text-3xl md:text-5xl font-semibold text-gray-900 leading-tight">Our Story</h1>
            <p className="mt-5 text-gray-600 leading-relaxed">
              It began in 2020, with a simple realization — food felt different when we travelled.
            </p>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Across Europe and Asia, every meal felt light, wholesome, and easy on the gut. But back home in India, the same ingredients left us feeling heavy and bloated.
            </p>
            <p className="mt-3 text-gray-600 leading-relaxed">
              That question stayed with us — <strong>why does real food feel so different from place to place?</strong>
            </p>
          </div>
          <div className="w-full">
            <Image
              src="/grainlly-demo/transparent_634x543.webp"
              width={1200}
              height={800}
              alt="Shopping experience illustration"
              className="w-full h-auto  "
              priority
            />
          </div>
        </section>

        {/* Discovery Section */}
        <section className="mt-12 bg-white rounded-xl border border-gray-200 p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">What we discovered changed everything.</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            It wasn't about the cuisine — it was about the soil. The purity of the land, the way crops were grown, the care for the earth — that's what made the difference.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            So we spent the next two to three years researching, studying, and understanding the link between soil health, farming, and food quality.
          </p>
          <p className="mt-4 text-gray-700 font-medium">
            And from that journey, <span className="text-lime-800">Grainlly</span> was born — to bring back the kind of grains that feel good to eat, because they're grown right.
          </p>
        </section>

        {/* Meet the Founder */}
        <section className="mt-16 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Meet the Founder</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              <strong>Arya Laxmi Pandit</strong> has spent over 15 years working as a Nutrition Researcher, studying how food truly affects the body.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Having worked with more than 3000 clients, He has seen how deeply our health is connected to what we eat — and how it's grown.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              His travels across the world deepened that understanding — that food diversity begins in the soil.
            </p>
            <p className="mt-4 text-gray-700 font-medium">
              With Grainlly, he set out to bring India's best regional grains back to the kitchen — pure, authentic, and rich with the story of their land.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-8 bg-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-lime-700 to-lime-900 flex items-center justify-center text-white text-3xl font-semibold">
                AP
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900">Arya Laxmi Pandit</div>
                <div className="text-sm text-gray-600">Founder & Nutrition Researcher</div>
              </div>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-lime-800 flex-shrink-0" />
                <span>15+ years in Nutrition Research</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-lime-800 flex-shrink-0" />
                <span>Worked with 3000+ clients</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-lime-800 flex-shrink-0" />
                <span>Expert in soil health & food quality</span>
              </div>
            </div>
          </div>
        </section>

        {/* The Grains That Tell Our Story */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">The Grains That Tell Our Story</h2>
          <p className="mt-3 text-gray-600">Each grain we choose carries the essence of the region it comes from — grown in its native soil, by farmers who've nurtured it for generations.</p>
          
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: "🌾", 
                title: "Gulbarga Tur Dal", 
                region: "Karnataka",
                text: "From the red, fertile lands of Gulbarga — rich in protein, warmth, and authenticity." 
              },
              { 
                icon: "🍚", 
                title: "Kerala Red Rice", 
                region: "Palakkad",
                text: "The beloved Matta rice — earthy, wholesome, and full of tradition." 
              },
              { 
                icon: "🌾", 
                title: "Maldandi Jowar", 
                region: "Maharashtra",
                text: "A heritage variety, grown under the strong sun of Solapur — naturally gluten-free and deeply nourishing." 
              },
              { 
                icon: "🌱", 
                title: "Nagaur Moong Dal", 
                region: "Rajasthan",
                text: "From India's \"City of Moong Dal,\" light, clean, and packed with gentle energy." 
              },
              { 
                icon: "🌾", 
                title: "Pusa Basmati 1121", 
                region: "North India",
                text: "Long, fragrant grains — grown sustainably with less water and more care." 
              },
            ].map((grain) => (
              <div key={grain.title} className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{grain.icon}</div>
                <div className="text-lg font-semibold text-gray-900">{grain.title}</div>
                <div className="text-xs text-lime-700 font-medium mt-1 mb-3">({grain.region})</div>
                <p className="text-sm text-gray-600 leading-relaxed">{grain.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Promise */}
        <section className="mt-16 bg-gradient-to-br from-lime-50 to-white rounded-xl border border-lime-200 p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center">Our Promise</h2>
          <p className="mt-4 text-center text-gray-700 text-lg max-w-2xl mx-auto">
            At Grainlly, we stay close to the soil.
          </p>
          
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-12 w-12 rounded-full bg-lime-100 flex items-center justify-center mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trusted Farmers</h3>
              <p className="text-sm text-gray-600">We work with trusted farmers who understand the land and respect traditional farming practices.</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-12 w-12 rounded-full bg-lime-100 flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Highest Standards</h3>
              <p className="text-sm text-gray-600">We choose only grains that meet the highest standards of purity, quality, and authenticity.</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-12 w-12 rounded-full bg-lime-100 flex items-center justify-center mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Earth Harmony</h3>
              <p className="text-sm text-gray-600">Good food isn't just about taste — it's about trust, health, and harmony with the earth.</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-lg font-medium text-gray-900">
              From the land, to your plate — that's the journey of every grain at Grainlly.
            </p>
          </div>
        </section>

        {/* Customer Reviews */}
        <CustomerReviews
          className="mt-16"
          title="Customers love Grainlly"
          subtitle="Real words from shoppers who trust us for speed, value, and great service."
        />


        {/* CTA */}
        <section className="mt-16">
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-lime-50 to-white p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900">Have questions or ideas?</h3>
              <p className="mt-2 text-gray-600">We’d love to hear from you. Reach out and we’ll get back within 1 business day.</p>
            </div>
            <a href="/contact" className="inline-flex items-center justify-center rounded-lg bg-lime-800 text-white px-5 py-3 font-medium hover:bg-lime-800 transition">
              Contact us
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

