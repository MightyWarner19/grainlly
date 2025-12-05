import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { assets } from "@/assets/assets";

const HomeProducts = () => {

  const { products, router } = useAppContext()

  return (
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full">Popular products</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-6 pb-14 w-full">
        {products.slice(0, 5).map((product, index) => <ProductCard key={index} product={product} />)}
      </div>

      <button onClick={() => { router.push('/all-products') }} className="group flex items-center justify-center gap-1 px-12 py-2.5 bg-lime-800 rounded text-white">
        See more
       
      </button>
      
    </div>
  );
};

export default HomeProducts;
