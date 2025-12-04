"use client"
import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Banner = () => {
    const router = useRouter();
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:pl-20 py-14 md:py-0 bg-[#E6E9F2] my-16 rounded-xl overflow-hidden">
      <Image
        className="max-w-56"
        src="/grainlly-demo/mmn.png"
        alt="cashew_butter_image"
        width={600}
        height={600}
      />
      <div className="flex flex-col items-center justify-center text-center space-y-2 px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-semibold max-w-[290px]">
          Organic Products 
        </h2>
        <p className="max-w-[343px] font-medium text-gray-800/60">
          At Grainlly, we bring nature back to your plate, with grains grown in harmony with the soil, the seasons and the wisdom of our Indian farming traditions. Our mission is to nourish every home with pure grains that honour our roots, support our farmers, and promote a healthier, more conscious way of living.
          
        </p>
        <button onClick={() => router.push('/all-products')} className="group flex items-center justify-center gap-1 px-12 py-2.5 bg-lime-800 rounded text-white">
          Buy now
          <Image className="group-hover:translate-x-1 transition" src={assets.arrow_icon_white} alt="arrow_icon_white" />
        </button>
      </div>
      <Image
        className="hidden md:block max-w-80 mr-2"
        src="/grainlly-demo/transparent_540x462.webp"
        alt="md_controller_image"
        width={600}
        height={600}
      />
      <Image
        className="md:hidden mr-2"
        src="/grainlly-demo/transparent_540x462.webp"
        alt="sm_controller_image"
        width={600}
        height={600}
      />
    </div>
  );
};

export default Banner;