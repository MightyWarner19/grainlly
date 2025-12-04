'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTachometerAlt, FaPlusCircle, FaBoxes, FaShoppingBag, FaTags, FaBlog, FaStar, FaEnvelope } from 'react-icons/fa';

const SideBar = () => {
    const pathname = usePathname()
    const menuItems = [
        { name: 'Dashboard', path: '/seller/dashboard', icon: FaTachometerAlt },
        { name: 'Add Product', path: '/seller', icon: FaPlusCircle },
        { name: 'Product List', path: '/seller/product-list', icon: FaBoxes },
        { name: 'Orders', path: '/seller/orders', icon: FaShoppingBag },
        { name: 'Categories', path: '/seller/category', icon: FaTags },
        { name: 'Blog', path: '/seller/blog', icon: FaBlog },
        { name: 'Testimonials', path: '/seller/testimonials', icon: FaStar },
        { name: 'Newsletter', path: '/seller/newsletter', icon: FaEnvelope },
    ];

    return (
        <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-300 py-2 flex flex-col'>
            {menuItems.map((item) => {

                const isActive = pathname === item.path;

                return (
                    <Link href={item.path} key={item.name} passHref>
                        <div
                            className={
                                `flex items-center py-3 px-4 gap-3 ${isActive
                                    ? "border-r-4 md:border-r-[6px] bg-lime-700/10 border-lime-700/90"
                                    : "hover:bg-gray-100/90 border-white"
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <p className='md:block hidden text-center'>{item.name}</p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default SideBar;
