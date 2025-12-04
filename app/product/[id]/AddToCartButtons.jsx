"use client";
import { useAppContext } from "@/context/AppContext";

export default function AddToCartButtons({ productId, isActive }) {
  const { addToCart, router, user } = useAppContext();

  return (
    <div className="flex items-center mt-10 gap-4">
      <button
        onClick={() => {
          if (isActive) {
            addToCart(productId);
          }
        }}
        disabled={!isActive}
        className={`w-full py-3.5 transition ${
          isActive
            ? "bg-gray-100 text-gray-800/80 hover:bg-gray-200 cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        Add to Cart
      </button>
      <button
        onClick={() => {
          if (isActive) {
            addToCart(productId);
            router.push(user ? "/cart" : "");
          }
        }}
        disabled={!isActive}
        className={`w-full py-3.5 text-white transition ${
          isActive
            ? "bg-[#8BA469] hover:bg-lime-700 cursor-pointer"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {isActive ? "Buy now" : "Not Available"}
      </button>
    </div>
  );
}
