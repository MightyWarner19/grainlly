import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const HeaderSlider = () => {
   const router = useRouter();
   
   const heroData = {
      title: "Pure, Natural & Wholesome Grains",
      description: "Experience farm-fresh, Organic grains delivered straight to your doorstep.",
      button1: "Shop Now",
      button2: "Our Story"
   };

   return (
      <div className="relative w-full h-[95vh] md:h-[90vh] lg:h-[92vh] xl:h-[90vh] bg-gray-900 overflow-hidden">
         {/* Background Image */}
         <div className="absolute inset-0 w-full h-full">
            <Image
               src="/bg-background.gif"
               alt="Background"
               fill
               className="object-cover opacity-50"
               priority
            />
            {/* <video
               src="https://res.cloudinary.com/dlzfm3kfk/video/upload/v1761195630/background-video_oifzrg.mp4"
               autoPlay
               muted
               loop
               className="absolute inset-0 w-full h-full object-cover opacity-50"
            /> */}
         </div>
         
         {/* Content */}
         <div className="relative z-10 h-full  flex items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
               <div className="max-w-md mt-[20vh] md:mt-[15vh] lg:mt-[0vh]">
                  {/* <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                     {heroData.title}
                  </h1> */}
                  <p className="text-xl text-gray-300 mb-10 max-w-sm">
                     {heroData.description}
                  </p>
                  <div className="flex flex-row gap-4">
                     <button 
                        onClick={() => {
                           window.scrollTo({
                              top: window.innerHeight,
                              behavior: 'smooth'
                           });
                        }}
                        className="px-8 py-4 bg-lime-900 hover:bg-lime-700 text-white font-medium rounded-lg transition-colors duration-300"
                     >
                        {heroData.button1}
                     </button>
                     <button 
                        onClick={() => router.push('/about')}
                        className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-medium rounded-lg transition-colors duration-300"
                     >
                        {heroData.button2}
                     </button>
                  </div>
               </div>
            </div>
         </div>
         
         {/* Decorative elements */}
         <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent z-0"></div>
         <div className="absolute top-1/2 right-0 w-64 h-64 bg-black/20 rounded-full -translate-y-1/2 translate-x-1/2 filter blur-3xl"></div>
      </div>
   );
};

export default HeaderSlider;
                   