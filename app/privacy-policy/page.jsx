"use client"
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <section className="max-w-4xl mx-auto px-6 md:px-8 lg:px-10 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="mt-8 space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Shipping Information</h2>
              <p className="mt-3">
                Free shipping is available on all orders dispatched via Trackon. We aim to ship within
                24–48 hours on regular working days; orders are not processed on Sundays or public
                holidays. During Mega Sale events, dispatch timelines may extend due to high order
                volumes, but we target shipping within 3–5 days of the order date. Please note that we
                cannot commit to specific delivery timelines and appreciate your patience.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Cancellation Policy</h2>
              <ul className="list-disc ml-6 mt-3 space-y-2">
                <li>Orders cannot be cancelled once they have been dispatched.</li>
                <li>Discount vouchers are single use. They are considered redeemed even if the order is cancelled.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Return &amp; Refund Policy</h2>
              <ul className="list-disc ml-6 mt-3 space-y-2">
                <li>Products are non-returnable due to their consumable and hygiene-sensitive nature.</li>
                <li>If you receive a damaged, tampered, or incorrect product, email us at <span className="font-medium">support@grainlly.in</span> within 24 hours of delivery with an unboxing video, product images, invoice, packaging, and batch number. We respond within 48–72 hours.</li>
                <li>Please keep the product unused while your complaint is being reviewed.</li>
                <li>Do not accept deliveries with tampered or damaged packaging.</li>
                <li>If an order is returned after unsuccessful delivery attempts, contact customer support for assistance with a voucher refund or a re-dispatch based on stock availability.</li>
                <li>No returns or replacements can be issued for packages received in damaged or tampered condition.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Payment Policy</h2>
              <ul className="list-disc ml-6 mt-3 space-y-2">
                <li>We accept Credit/Debit Cards, Internet Banking, UPI, and Cash on Delivery.</li>
                <li>If your payment is debited without order confirmation, contact customer support with the transaction details, registered email address, contact number, full order information, and amount debited.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Pricing</h2>
              <p className="mt-3">
                Product pricing displayed on the website is the final payable price. In case of technical
                errors, supplier updates, or typographical issues, prices may change. If you notice a
                discrepancy before or after placing an order, please notify us within 48 hours. Once
                validated, price differences will be refunded within 10–15 business days using the original
                payment method or as outlined in our refund policy. Grainlly Foods reserves the right to
                rectify pricing errors or cancel affected orders. Product availability and pricing may
                change without prior notice at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Contact Us</h2>
              <p className="mt-3">
                For any queries related to these policies, reach out to us at
                <span className="font-medium"> support@grainlly.in</span>.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
