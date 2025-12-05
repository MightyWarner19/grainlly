// components/AnnouncementBar.tsx
"use client";

import React, { useEffect, useState } from "react";
import { FaLinkedinIn, FaRegWindowClose } from "react-icons/fa";
import Link from "next/link";
import NextImage from "next/image";
import { FaFacebookF, FaInstagram, FaYoutube, FaGoogle } from "react-icons/fa";

export default function AnnouncementBar({ onHeightChange }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const barRef = React.useRef(null);

  // Check if this is the first visit
  useEffect(() => {
    setIsMounted(true);
    const isFirstVisit = !sessionStorage.getItem('grainllyAnnouncementDismissed');
    setIsVisible(isFirstVisit);
  }, []);

  // Update parent about height changes
  useEffect(() => {
    if (isVisible && barRef.current && onHeightChange) {
      const height = barRef.current.offsetHeight;
      onHeightChange(height);
      return () => onHeightChange(0);
    }
  }, [isVisible, onHeightChange]);

  const handleClose = () => {
    setIsVisible(false);
    if (onHeightChange) onHeightChange(0);
    sessionStorage.setItem('grainllyAnnouncementDismissed', 'true');
  };

  if (typeof window === 'undefined' || !isMounted || !isVisible) return null;

  return (
    <div
      ref={barRef}
      className="w-full bg-black border-b border-[#c8dd9b] flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 text-[#46611f] font-medium text-sm sm:text-base animate-fade-in-down"
      role="alert"
    >
      <div className="w-full max-w-8xl mx-auto flex items-center  justify-between">
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center sm:text-left">
          <div className="flex items-center">
            <span className="mr-2">🌾</span>
            <span className="whitespace-nowrap font-semibold text-white">
              Harvest Savings: Free delivery on orders
            </span>
          </div>
          {/* <Link
            href="/all-products" 
            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-[#8BA469] via-[#769250] to-[#8BA469] hover:from-[#769250] hover:to-[#8BA469] text-white text-sm sm:text-base font-semibold rounded-md shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
            onClick={(e) => e.stopPropagation()}
          >
            Shop Organic Picks
          </Link> */}
        </div>
        <div className="hidden sm:flex items-center gap-3 ml-4">
          <Link href="https://www.instagram.com/grainlly_?igsh=MXIxOTVuaDU1YmE0Yg==" aria-label="Grainlly on Instagram" target="_blank" className="text-white  transition-colors">
            <FaInstagram size={18} />
          </Link>
          <Link href="https://www.facebook.com/profile.php?id=61578609146141" aria-label="Grainlly on Facebook" target="_blank" className="text-white  transition-colors">
            <FaFacebookF size={18} />
          </Link>
          <Link href="https://www.youtube.com/@Grainlly" aria-label="Grainlly on YouTube" target="_blank" className="text-white  transition-colors">
            <FaYoutube size={20} />
          </Link>
          {/* <Link href="https://g.page/r/Grainlly" aria-label="Grainlly on Google" target="_blank" className="text-white  transition-colors">
            <NextImage src="/google-my-business.svg" alt="google" className="w-5 h-5 object-contain text-white" width={20} height={20} />
          </Link> */}
          <Link href="https://www.linkedin.com/in/grainlly" aria-label="LinkedIn" target="_blank" className="text-white  transition-colors">
            <FaLinkedinIn size={20} />
          </Link>
        </div>
        <button
          aria-label="Close announcement"
          className="text-white  transition-colors p-1.5 sm:p-1 rounded-full ml-2"
          onClick={handleClose}
          type="button"
        >
          <FaRegWindowClose size={20} className="sm:w-6 sm:h-6 w-5 h-5 hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
