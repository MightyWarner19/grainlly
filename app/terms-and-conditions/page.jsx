"use client"
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsAndConditions = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <section className="max-w-4xl mx-auto px-6 md:px-8 lg:px-10 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Terms & Conditions</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="mt-8 space-y-8 text-gray-700">
            <p>
              These Terms & Conditions ("Terms") govern your use of our website and services. By accessing or
              using the site, you agree to be bound by these Terms. If you do not agree, please do not use the site.
            </p>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">1. Account & Eligibility</h2>
              <ul className="list-disc ml-6 mt-3 space-y-2">
                <li>You must be at least 18 years old or have parental consent to use our services.</li>
                <li>You are responsible for maintaining the confidentiality of your account and password.</li>
                <li>You agree to provide accurate and complete information when creating an account.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">2. Orders & Payments</h2>
              <ul className="list-disc ml-6 mt-3 space-y-2">
                <li>All orders are subject to acceptance and availability.</li>
                <li>Prices, offers, and availability are subject to change without notice.</li>
                <li>We reserve the right to cancel orders in cases of suspected fraud or errors.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">3. Shipping & Delivery</h2>
              <ul className="list-disc ml-6 mt-3 space-y-2">
                <li>Estimated delivery times are provided for convenience and are not guaranteed.</li>
                <li>Risk of loss for items passes to you upon delivery.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">4. Returns & Refunds</h2>
              <p className="mt-3">
                Returns and refunds are subject to our <a href="/refund-policy" className="text-[#8BA469] underline">Refund Policy</a>.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">5. Intellectual Property</h2>
              <p className="mt-3">
                All content on the site, including text, graphics, logos, and images, is our property or licensed to us
                and is protected by applicable copyright and trademark laws.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">6. Prohibited Activities</h2>
              <ul className="list-disc ml-6 mt-3 space-y-2">
                <li>Misusing the site, uploading harmful content, or attempting to breach security.</li>
                <li>Engaging in fraudulent, deceptive, or illegal activities.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">7. Limitation of Liability</h2>
              <p className="mt-3">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special,
                or consequential damages arising from your use of the site or products.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">8. Changes to Terms</h2>
              <p className="mt-3">
                We may update these Terms from time to time. Your continued use of the site after updates constitutes
                acceptance of the revised Terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">9. Contact</h2>
              <p className="mt-3">
                For any questions about these Terms, contact us at
                <span className="font-medium"> support@grainlly.com</span>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default TermsAndConditions;
