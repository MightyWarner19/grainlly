"use client";
import React from 'react'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }) => {

    const { currency, router, addToCart } = useAppContext()
    const regularPrice = parseFloat(product.price) || 0
    const offerPrice = parseFloat(product.offerPrice) || 0
    const discountPercent = regularPrice > 0 && offerPrice > 0 && offerPrice < regularPrice
        ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
        : 0

    return (
        <div
            onClick={() => { router.push('/product/' + (product.slug || product._id)); scrollTo(0, 0) }}
            className="flex flex-col items-start gap-1 max-w-[260px] sm:max-w-[280px] w-full cursor-pointer"
        >
            <div className="cursor-pointer group relative bg-gray-500/10 rounded-xl w-full h-64 md:h-72 flex items-center justify-center">
                <Image
                    src={product.image[0]}
                    alt={product.name}
                    className="group-hover:scale-105 transition object-cover w-full h-full rounded-xl"
                    width={800}
                    height={800}
                />
                {!product.isActive && (
                    <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                        <span className="px-3 py-1 text-xs md:text-sm font-medium text-white bg-red-600/90 rounded">Out of Stock</span>
                    </div>
                )}
                {/* <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
                    <Image
                        className="h-3 w-3"
                        src={assets.heart_icon}
                        alt="heart_icon"
                    />
                </button> */}
            </div>

            <p className="text-base md:text-lg font-medium pt-2 w-full truncate">{product.name}</p>
            <p className="w-full text-sm md:text-base text-gray-500/70 max-sm:hidden truncate">{product.shortDescription}</p>
            <div className="flex items-center gap-2">
                <p className="text-sm">{product.rating || 0}</p>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => {
                        const rating = product.rating || 0;
                        const fullStars = Math.floor(rating);
                        const hasDecimal = rating % 1 > 0;
                        
                        if (index < fullStars) {
                            // Full star
                            return (
                                <svg
                                    key={index}
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="#FFC107"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                            );
                        } else if (index === fullStars && hasDecimal) {
                            // Half star
                            return (
                                <svg
                                    key={index}
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <defs>
                                        <linearGradient id={`halfGrad-card-${product._id}-${index}`}>
                                            <stop offset="50%" stopColor="#FFC107" />
                                            <stop offset="50%" stopColor="#E0E0E0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                        fill={`url(#halfGrad-card-${product._id}-${index})`}
                                    />
                                </svg>
                            );
                        } else {
                            // Empty star
                            return (
                                <svg
                                    key={index}
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="#E0E0E0"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                            );
                        }
                    })}
                </div>
            </div>

            <div className="flex items-end justify-between w-full mt-1">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg md:text-xl font-medium text-gray-800">₹ {product.offerPrice}</span>
                        {discountPercent > 0 && (
                            <>
                                <span className="text-base md:text-xl line-through text-gray-400">₹ {product.price}</span>
                                <span className="text-sm md:text-base text-lime-700 font-semibold">
                                    ({discountPercent}% OFF)
                                </span>
                            </>
                        )}
                    </div>
                    {/* {!product.isActive && (
                        <p className="text-xs text-red-500 mt-1">Out of Stock</p>
                    )} */}
                </div>
                {/* <button
                    onClick={(e) => { e.stopPropagation(); if (product.isActive) { router.push('/product/' + product._id); } }}
                    disabled={!product.isActive}
                    className={`max-sm:hidden px-5 py-2 text-white border border-gray-500/20 rounded-full text-xs md:text-sm transition ${product.isActive ? 'bg-[#8BA469] hover:bg-[#8BA469]/90 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    {product.isActive ? 'View Details' : 'Not Available'}
                </button> */}
            </div>
        </div>
    )
}

export default ProductCard