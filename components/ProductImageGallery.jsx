'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';

export default function ProductImageGallery({ images = [], productName, isActive }) {
  const [currentImage, setCurrentImage] = useState(images?.[0] || "/placeholder.png");
  const selectedIdx = images.findIndex(img => img === currentImage);
  const thumbsRef = useRef([]);

  // Keyboard navigation for accessibility
  const handleThumbnailKeyDown = (e, idx) => {
    if (e.key === "ArrowRight" && thumbsRef.current[idx + 1]) {
      thumbsRef.current[idx + 1].focus();
    }
    if (e.key === "ArrowLeft" && thumbsRef.current[idx - 1]) {
      thumbsRef.current[idx - 1].focus();
    }
    if (e.key === "Enter" || e.key === " ") {
      setCurrentImage(images[idx]);
    }
  };

  return (
    <div className="w-full  sticky top-24 self-start">
      <div className="rounded-xl overflow-hidden bg-gray-500/10 mb-5 relative shadow-lg transition-all duration-300">
        <Image
          src={currentImage}
          alt={productName}
          width={800}
          height={600}
          priority
          className="w-full max-h-[480px] object-cover bg-white transition-opacity duration-300"
        />
        {!isActive && (
          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center z-10">
            <span className="px-4 py-2 text-base font-semibold text-white bg-red-600/90 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 sm:gap-5">
        {images.map((image, index) => (
          <button
            key={index}
            ref={el => thumbsRef.current[index] = el}
            className={`rounded-lg overflow-hidden bg-gray-100 hover:bg-gray-200 shadow-sm cursor-pointer 
              outline-none focus:ring-2 focus:ring-lime-500 transition
              ${index === selectedIdx ? "ring-2 ring-lime-600 ring-offset-2 opacity-100" : "opacity-80"}
            `}
            tabIndex={0}
            aria-label={`Show ${productName} image ${index + 1}`}
            onMouseEnter={() => setCurrentImage(image)}
            onFocus={() => setCurrentImage(image)}
            onClick={() => setCurrentImage(image)}
            onKeyDown={e => handleThumbnailKeyDown(e, index)}
          >
            <Image
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              width={160}
              height={160}
              className="w-full aspect-square object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
