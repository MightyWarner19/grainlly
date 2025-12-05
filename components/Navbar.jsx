"use client"
import React from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";
import AnnouncementBar from "./AnnouncementBar";

const Navbar = () => {

  const { isSeller, router, user, getCartCount } = useAppContext();
  const { openSignIn } = useClerk()

  return (
    <>
      <AnnouncementBar />
      <nav className="flex items-center justify-between px-6 md:px-8 lg:px-16 py-3 border-b border-gray-300 text-gray-700">
        <div className="flex items-center gap-2">
          <Image
            className="cursor-pointer w-auto md:w-auto h-5 md:h-4.5"
            onClick={() => router.push('/')}
            src="/grainlly-logo.png"
            width={129}
            height={28}
            alt="logo"
          />
          {/* <h1 
            className="text-2xl md:text-4xl text-lime-700 font-black tracking-tight cursor-pointer transition-all duration-300 hover:opacity-90"
            onClick={() => router.push('/')}
            style={{ 
              fontFamily: "'Arial', sans-serif",
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            GRAINLLY
          </h1> */}
          </div>
        <div className="flex items-center gap-4 lg:gap-8 max-md:hidden ">
          <Link href="/" className="hover:text-gray-900 transition">
            Home
          </Link>
          <Link href="/all-products" className="hover:text-gray-900 transition">
            Products
          </Link>
          <Link href="/about" className="hover:text-gray-900 transition">
            About Us
          </Link>
          <Link href="/blog" className="hover:text-gray-900 transition">
            Blog
          </Link>

          <Link href="/contact" className="hover:text-gray-900 transition">
            Get in touch
          </Link>

          <Link href="/cart" className="relative flex items-center gap-2 hover:text-gray-900 transition">
            <CartIcon />

            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-4 bg-lime-700 text-white text-[10px] leading-none px-2 py-1 rounded-full text-center">
                {getCartCount()}
              </span>
            )}
          </Link>


          {isSeller && <button onClick={() => router.push('/seller/dashboard')} className="text-xs border px-4 py-1.5 rounded-full">Admin</button>}

        </div>

        <ul className="hidden md:flex items-center gap-4 ">

          {
            user
              ? <>
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action label="Cart" labelIcon={<CartIcon />} onClick={() => router.push('/cart')} />
                  </UserButton.MenuItems>
                  <UserButton.MenuItems>
                    <UserButton.Action label="My Orders" labelIcon={<BagIcon />} onClick={() => router.push('/my-orders')} />
                  </UserButton.MenuItems>
                </UserButton>
              </>
              : <button onClick={openSignIn} className="flex items-center gap-2 hover:text-gray-900 transition">
                <Image src={assets.user_icon} alt="user icon" />
                Account
              </button>
          }
        </ul>

        <div className="flex items-center md:hidden gap-10">
          {isSeller && <button onClick={() => router.push('/seller/dashboard')} className="text-xs border px-4 py-1.5 rounded-full">Admin</button>}
          <Link href="/cart" className="relative flex items-center gap-2 hover:text-gray-900 transition">
            <CartIcon />
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-4 bg-lime-700 text-white text-[10px] leading-none px-2 py-1 rounded-full text-center">
                {getCartCount()}
              </span>
            )}
          </Link>

          {
            user
              ? <>
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action label="Home" labelIcon={<HomeIcon />} onClick={() => router.push('/')} />
                  </UserButton.MenuItems>
                  <UserButton.MenuItems>
                    <UserButton.Action label="Products" labelIcon={<BoxIcon />} onClick={() => router.push('/all-products')} />
                  </UserButton.MenuItems>
                  <UserButton.MenuItems>
                    <UserButton.Action label="Cart" labelIcon={<CartIcon />} onClick={() => router.push('/cart')} />
                  </UserButton.MenuItems>
                  <UserButton.MenuItems>
                    <UserButton.Action label="My Orders" labelIcon={<BagIcon />} onClick={() => router.push('/my-orders')} />
                  </UserButton.MenuItems>
                </UserButton>
              </>
              : <button onClick={openSignIn} className="flex items-center gap-2 hover:text-gray-900 transition">
                <Image src={assets.user_icon} alt="user icon" />
                Account
              </button>
          }
        </div>
      </nav>
    </>
  );
};

export default Navbar;