"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";

// Reusable customer reviews component
// Props:
// - title?: string (default: "What our customers say")
// - subtitle?: string
// - className?: string
// - autoplay?: boolean
// - interval?: number
// - visibleCount?: number
// - responsive?: boolean
export default function CustomerReviews({
  title = "What our customers say",
  subtitle,
  className = "",
  autoplay = true,
  interval = 3000,
  visibleCount = 3,
  responsive = true,
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(visibleCount);
  const timerRef = useRef(null);

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await axios.get('/api/testimonial/list?activeOnly=true');
        if (data.success && data.testimonials.length > 0) {
          setReviews(data.testimonials);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (!responsive) {
      setVisible(visibleCount);
      return;
    }
    const computeVisible = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1024;
      if (w < 640) return 1;
      if (w < 1024) return Math.min(2, visibleCount);
      return visibleCount;
    };
    const update = () => setVisible(computeVisible());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [responsive, visibleCount]);

  // autoplay effect
  const totalPages = Math.max(1, reviews.length - visible + 1);

  useEffect(() => {
    if (!autoplay || totalPages <= 1) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % totalPages);
    }, interval);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, autoplay, interval, totalPages]);

  const goTo = (i) => setIndex(((i % totalPages) + totalPages) % totalPages);
  const prev = () => setIndex((i) => (i - 1 + totalPages) % totalPages);
  const next = () => setIndex((i) => (i + 1) % totalPages);

  const stars = (count = 5) =>
    Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={i < (count || 0) ? "#3f6212" : "#e5e7eb"}
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.035a1 1 0 00-1.176 0l-2.802 2.035c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));

  // Don't render if no reviews or still loading
  if (loading || reviews.length === 0) {
    return null;
  }

  return (
    <section className={`px-6 md:px-16 lg:px-32 py-12 bg-[#FBFAF9] ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        ) : null}
      </div>

      {/* Slider */}
      <div className="relative mt-8">
        {/* Track */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * (100 / visible)}%)` }}
          >
            {reviews.map((r, idx) => (
              <div
                key={idx}
                className="p-6"
                style={{ minWidth: `${100 / visible}%`, flexBasis: `${100 / visible}%` }}
              >
                <figure className="max-w-2xl mx-auto">
                  <div className="flex items-center border-b border-gray-200 pb-3 gap-3">
                    {r.avatar ? (
                      <Image
                        src={r.avatar}
                        width={40}
                        height={40}
                        alt={`${r.name} avatar`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-lime-800 text-white flex items-center justify-center text-sm font-semibold">
                        {r.name?.charAt(0) || "C"}
                      </div>
                    )}
                    <div>
                      <figcaption className="text-sm font-medium text-gray-900">{r.name}</figcaption>
                      {r.role ? <div className="text-xs text-gray-500">{r.role}</div> : null}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1" aria-label={`Rating: ${r.rating || 0} out of 5`}>
                    {stars(r.rating)}
                  </div>
                  <blockquote className="mt-3 text-gray-700 text-sm leading-relaxed">“{r.comment}”</blockquote>
                </figure>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={prev}
            className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50"
            aria-label="Previous review"
          >
            ‹
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-lime-800" : "w-2.5 bg-gray-300"
                }`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50"
            aria-label="Next review"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
