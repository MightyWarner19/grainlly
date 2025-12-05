import React from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Playfair_Display } from "next/font/google";
import FAQ from "@/components/FAQ";

export const metadata = {
  title: "Contact | Grainlly E-Commerce",
  description: "Get in touch with Grainlly.",
};

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });

export default function ContactPage() {

  return (
    <>
      <Navbar />
      <main className="px-0 md:px-0 lg:px-0 " >
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7ef] to-[#fafdf9]" />
          <div className="relative px-6 md:px-16 lg:px-32 py-20 md:py-24 text-center">
            <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold text-gray-900 tracking-tight`}>Get In Touch</h1>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="px-6 md:px-16 lg:px-32 -mt-10 md:-mt-12 pb-16">
          {/* Overlapping decorative leaf */}
          <div className="relative mx-auto max-w-6xl">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
              <Image src="https://websitedemos.net/organic-shop-02/wp-content/uploads/sites/465/2021/03/basil-leaf.png" alt="decor" width={100} height={64} />
            </div>
          </div>
          <div className="relative mx-auto max-w-6xl bg-white rounded-2xl shadow-md border border-[#e7f2e6]">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#eaf4e9]">
              <div className="p-8 flex items-center gap-5">
                <div className="shrink-0 w-12 h-12 rounded-full bg-[#e9f6ea] flex items-center justify-center">
                  <Image src="/icon-phone.svg" alt="Phone" width={28} height={28} />
                </div>
                <div className="text-gray-800">
                  <p className="font-normal">+91 9504314314</p>
                
                </div>
              </div>
              <div className="p-8 flex items-center gap-5">
                <div className="shrink-0 w-12 h-12 rounded-full bg-[#e9f6ea] flex items-center justify-center">
                  <Image src="/icon-mail.svg" alt="Email" width={28} height={28} />
                </div>
                <div className="text-gray-800">
                  <p className="font-normal">suggestion@grainlly.com</p>
                  
                </div>
              </div>
              <div className="p-8 flex items-center gap-5">
                <div className="shrink-0 w-12 h-12 rounded-full bg-[#e9f6ea] flex items-center justify-center">
                  <Image src="/icon-location.svg" alt="Location" width={28} height={28} />
                </div>
                <div className="text-gray-800">
                  <p className="font-normal">Office No. TI-A1/104, 1st Floor  BramhaCorp Business Park, Survey Number 7 Road New Kalyani Nagar, Vadgaonsheri, Pune-411014</p>
                
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 md:px-16 lg:px-32 pb-16">
          <div className="text-center">
            <h2 className={`${playfair.className} text-3xl md:text-4xl font-bold text-gray-900 tracking-tight`}>
              Frequently Asked Question!
            </h2>
          </div>
          <FAQ />
        </section>
        <Footer />
      </main>
    </>
  );
}
