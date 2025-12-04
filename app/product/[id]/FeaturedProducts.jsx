"use client";
import ProductCard from "@/components/ProductCard";
import { useAppContext } from "@/context/AppContext";

export default function FeaturedProducts({ products }) {
  const { router } = useAppContext();

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center mb-4 mt-16">
        <p className="text-3xl font-medium">
          Featured <span className="font-medium text-lime-700">Products</span>
        </p>
        <div className="w-28 h-0.5 bg-lime-700 mt-2"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 mt-6 pb-14 w-full">
        {products.slice(0, 4).map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>
      <button
        onClick={() => {
          router.push("/all-products");
        }}
        className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
      >
        See more
      </button>
    </div>
  );
}
