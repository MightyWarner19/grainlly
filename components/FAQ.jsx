"use client";
import React, { useEffect, useRef, useState } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });

const items = [
  { 
    q: "How do I track my order?", 
    a: "Once your order is shipped, you’ll receive an email and WhatsApp update with a tracking link. You can use this link to check your order status anytime." 
  },
  { 
    q: "Are all Grainlly products organic?", 
    a: "Yes! All our products are sourced directly from trusted farms and certified suppliers to ensure they are 100% authentic, natural, and free from harmful chemicals or additives." 
  },
  { 
    q: "Can I return or exchange a product?", 
    a: "If you receive a damaged, defective, or incorrect product, you can raise a return request within 1 day of delivery. For hygiene and food safety reasons, opened packages cannot be returned." 
  },
  { 
    q: "How long does delivery take?", 
    a: "Orders are typically delivered within 3–7 business days, depending on your location. You’ll receive updates via email and WhatsApp once your order is dispatched." 
  },
  { 
    q: "Do you deliver across India?", 
    a: "Yes, we deliver to most pin codes across India through our reliable courier partners." 
  },
  { 
    q: "How should I store Grainlly products?", 
    a: "Store our products in a cool, dry place, away from moisture and direct sunlight. Once opened, transfer the contents to an airtight container for freshness." 
  },
];


function AccordionItem({ item, isOpen, onToggle }) {
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const next = isOpen ? `${el.scrollHeight}px` : "0px";
    setMaxHeight(next);
  }, [isOpen, item.a]);

  return (
    <div className="group bg-white p-5 rounded-xl border border-[#c6efce]">
      <button
        type="button"
        onClick={onToggle}
        className="w-full cursor-pointer list-none select-none font-medium text-gray-900 flex items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <span>{item.q}</span>
        <span
          className={`ml-4 h-6 w-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm transition-transform ${
            isOpen ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>
      <div
        ref={contentRef}
        style={{ maxHeight }}
        className="mt-2 text-sm text-gray-700 overflow-hidden transition-[max-height] duration-300 ease-in-out"
      >
        <div className="pb-5">{item.a}</div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const timerRef = useRef(null);
  const TRANSITION_MS = 320; 

  return (


      <div className="mt-10 grid md:grid-cols-2 gap-7">
        {items.map((item, idx) => (
          <AccordionItem
            key={idx}
            item={item}
            isOpen={openIndex === idx}
            onToggle={() => {
              if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
              }
              if (openIndex === idx) {
                // Close if the same item is clicked
                setOpenIndex(null);
              } else if (openIndex !== null) {
                // Close current first to avoid two open during animation
                setOpenIndex(null);
                timerRef.current = setTimeout(() => {
                  setOpenIndex(idx);
                  timerRef.current = null;
                }, TRANSITION_MS);
              } else {
                setOpenIndex(idx);
              }
            }}
          />
        ))}
      </div>
  
  );
}
