"use client"
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <section className="max-w-4xl mx-auto px-6 md:px-8 lg:px-10 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Refund & Return Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="mt-8 space-y-8 text-gray-700">
            <p>
              We want you to be completely satisfied with your purchase. This policy outlines the
              conditions under which refunds, returns, and replacements may be accepted.
            </p>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">1. Eligibility for Return</h2>
              <ul className="list-disc ml-6 mt-3 space-y-2">
                <li>Items must be unused, in original packaging, and in the same condition as received.</li>
                <li>Return request must be initiated within 7 days of delivery.</li>
                <li>Certain perishable or hygiene-sensitive items may not be eligible for return.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">2. Non-Returnable Items</h2>
              <ul className="list-disc ml-6 mt-3 space-y-2">
                <li>Opened or partially used consumables.</li>
                <li>Items without original packaging, tags, or invoice.</li>
                <li>Custom or personalized items unless defective.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">3. Damaged or Incorrect Items</h2>
              <p className="mt-3">
                If you receive a damaged or incorrect item, please contact us within 48 hours of delivery
                with photos/videos as evidence. We will arrange a replacement or refund after verification.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">4. Refunds</h2>
              <ul className="list-disc ml-6 mt-3 space-y-2">
                <li>Approved refunds will be processed to the original payment method.</li>
                <li>Refunds typically take 5–7 business days after approval to reflect.</li>
                <li>Shipping charges are non-refundable unless the return is due to our error.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">5. Return Process</h2>
              <ul className="list-disc ml-6 mt-3 space-y-2">
                <li>Initiate a return request via your account order page or contact support.</li>
                <li>Ensure the item is securely packed to avoid damage in transit.</li>
                <li>Once received and inspected, we will notify you of the approval or rejection of your refund.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">6. Contact</h2>
              <p className="mt-3">
                For returns or refund questions, contact us at
                <span className="font-medium"> support@grainlly.com</span> with your order ID.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default RefundPolicy;
