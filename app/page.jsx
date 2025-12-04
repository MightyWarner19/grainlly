'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import CustomerReviews from "@/components/CustomerReviews";

const Home = () => {
  return (
    <>
      <Navbar/>
      <HeaderSlider />
      <div className="px-6 md:px-16 lg:px-32">
        
        <HomeProducts />
        {/* <FeaturedProduct />  */}
        <Banner />
        <CustomerReviews />
        {/* <FAQ /> */}
        <NewsLetter />
      </div>
      <Footer />
    </>
  );
};

export default Home;
