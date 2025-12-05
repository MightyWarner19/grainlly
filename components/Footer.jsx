import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 border-b border-white/10">
        <div className="w-full md:w-2/5">
          <Image className="w-auto h-16 md:h-20" src="/brand-logo.jpeg" width={100} height={100} alt="logo" />
          <p className="mt-6 text-sm text-gray-400">
            Grainlly brings you the finest regional grains from across India. 
            From soil to your plate, we ensure quality, authenticity, and tradition in every grain.
          </p>
          
        </div>

        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-white mb-5">Quick Links</h2>
            <ul className="text-sm space-y-2">
              <li>
                <Link className="hover:text-white transition" href="/">Home</Link>
              </li>
              <li>
                <Link className="hover:text-white transition" href="/about">About us</Link>
              </li>
              <li>
                <Link className="hover:text-white transition" href="/blog">Blog</Link>
              </li>
              <li>
                <Link className="hover:text-white transition" href="/contact">Get in touch</Link>
              </li>
              <li>
                <Link className="hover:text-white transition" href="/privacy-policy">Privacy policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-white mb-5">Get in touch</h2>
            <div className="text-sm space-y-2 text-gray-300">
              <p>+91 9504314314</p>
              <p>support@grainlly.in</p>
              <p>Address: Office No. TI-A1/104, 1st Floor  BramhaCorp Business Park, Survey Number 7 Road New Kalyani Nagar, Vadgaonsheri, Pune-411014</p>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <a
                href="https://www.instagram.com/grainlly_?igsh=MXIxOTVuaDU1YmE0Yg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-400 hover:text-white transition"
                title="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61578609146141"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-gray-400 hover:text-white transition"
                title="Facebook"
              >
                <FaFacebookF size={20} />
              </a>
              <a
                href="https://www.youtube.com/@Grainlly"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Youtube"
                className="text-gray-400 hover:text-white transition"
                title="Youtube"
              >
                <FaYoutube size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/grainlly"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-white transition"
                title="LinkedIn"
              >
                <FaLinkedinIn size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
      <p className="py-4 text-center text-xs md:text-sm text-gray-400">
        Copyright 2025 © Grainlly All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;
