import React from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import AddToCartButtons from "./AddToCartButtons";
import FeaturedProducts from "./FeaturedProducts";
import ProductImageGallery from "@/components/ProductImageGallery";

export const revalidate = 0;

async function getProductBySlug(slug) {
  await connectDB();

  const doc = await Product.findOne({ slug }).lean();
  if (!doc) return null;

  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    shortDescription: doc.shortDescription,
    description: doc.description,
    price: doc.price,
    offerPrice: doc.offerPrice,
    image: doc.image,
    category: doc.category,
    isActive: doc.isActive,
    rating: doc.rating,
    brand: doc.brand,
    color: doc.color,
    weight: doc.weight,
    unit: doc.unit,
    stock: doc.stock,
    sku: doc.sku,
    benefits: doc.benefits || [],
    faqs: doc.faqs || [],
  };
}

async function getFeaturedProducts(currentId) {
  await connectDB();

  const docs = await Product.find({ _id: { $ne: currentId } })
    .sort({ date: -1 })
    .limit(8)
    .lean();

  return docs.map((doc) => ({ ...doc, _id: doc._id.toString() }));
}

export async function generateStaticParams() {
  await connectDB();
  const docs = await Product.find({ slug: { $exists: true, $ne: null } }, "slug").lean();
  return docs.filter((doc) => doc.slug).map((doc) => ({ id: doc.slug }));
}

export async function generateMetadata({ params }) {
  const { id: slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found | Grainlly",
      description: "The requested product could not be found.",
    };
  }

  const title = `${product.name} | Grainlly`;
  const plainDescription = product.description?.replace(/<[^>]+>/g, " ") || "";
  const description = product.shortDescription || plainDescription.slice(0, 160);
  const images = Array.isArray(product.image) && product.image.length > 0 ? [{ url: product.image[0] }] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
    },
  };
}

const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const getDiscountPercent = (price, offerPrice) => {
  const regularPrice = Number(price) || 0;
  const discountedPrice = Number(offerPrice) || 0;
  if (regularPrice <= 0 || discountedPrice <= 0 || discountedPrice >= regularPrice) return 0;
  return Math.round(((regularPrice - discountedPrice) / regularPrice) * 100);
};

export default async function ProductPage({ params }) {
  const { id: slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const featuredProducts = await getFeaturedProducts(product.id);
  const discountPercent = getDiscountPercent(product.price, product.offerPrice);

  console.log('Product data:', product);
  console.log('FAQs:', product.faqs);
  console.log('FAQs count:', product.faqs?.length || 0);
  console.log('Benefits:', product.benefits);
  console.log('Benefits count:', product.benefits?.length || 0);

  return (
    <>
      <Navbar />
      <main className="px-6 md:px-16 lg:px-32 pt-14" role="main">
        <article className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16" itemScope itemType="https://schema.org/Product">
          <section className="md:sticky md:top-24 md:self-start" aria-label="Product Images">
            <ProductImageGallery
              images={product.image}
              productName={product.name}
              isActive={product.isActive}
            />
          </section>

          <section className="flex flex-col py-4" aria-label="Product Information">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4" itemProp="name">{product.name}</h1>
            <div className="flex items-center gap-2" role="group" aria-label="Product Rating">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => {
                  const rating = product.rating || 0;
                  const fullStars = Math.floor(rating);
                  const hasDecimal = rating % 1 > 0;

                  if (index < fullStars) {
                    return (
                      <svg key={index} className="h-4 w-4" viewBox="0 0 24 24" fill="#FFC107" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    );
                  }
                  if (index === fullStars && hasDecimal) {
                    return (
                      <svg key={index} className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <defs>
                          <linearGradient id={`halfGrad-${index}`}>
                            <stop offset="50%" stopColor="#FFC107" />
                            <stop offset="50%" stopColor="#E0E0E0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                          fill={`url(#halfGrad-${index})`}
                        />
                      </svg>
                    );
                  }
                  return (
                    <svg key={index} className="h-4 w-4" viewBox="0 0 24 24" fill="#E0E0E0" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  );
                })}
              </div>
              <p itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                (<span itemProp="ratingValue">{product.rating || 0}</span>)
                <meta itemProp="bestRating" content="5" />
                <meta itemProp="worstRating" content="1" />
              </p>
            </div>
            <div className="text-gray-600 mt-3">
              <h2 className="text-lg font-medium" itemProp="description">{product.shortDescription}</h2>
            </div>
            <div
              className="text-gray-600 mt-3"
              dangerouslySetInnerHTML={{ __html: product.description || '' }}
              itemProp="description"
            />
            <div className="flex items-center gap-2 mt-6" role="group" aria-label="Product Pricing" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span className="text-3xl text-gray-800" itemProp="price" content={product.offerPrice}>{formatCurrency(product.offerPrice)}</span>
              <meta itemProp="priceCurrency" content="INR" />
              <meta itemProp="availability" content={product.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
              {discountPercent > 0 && (
                <>
                  <span className="text-base md:text-xl line-through text-gray-400" aria-label="Original price">{formatCurrency(product.price)}</span>
                  <span className="text-sm md:text-base text-lime-700 font-semibold" aria-label="Discount percentage">
                    ({discountPercent}% OFF)
                  </span>
                </>
              )}
            </div>
            {!product.isActive && (
              <p className="text-sm text-red-500 mt-2" role="status" aria-live="polite">Out of Stock</p>
            )}
            <hr className="bg-gray-600 my-6" role="separator" />
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72" role="table" aria-label="Product Specifications">
                <tbody>
                  <tr>
                    <td className="text-gray-600 font-medium">Brand</td>
                    <td className="text-gray-800/80 ">{product.brand || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Color</td>
                    <td className="text-gray-800/80 ">{product.color || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Category</td>
                    <td className="text-gray-800/80">
                      {product.category || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Unit</td>
                    <td className="text-gray-800/80">{product.weight || 'N/A'} {product.unit || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <AddToCartButtons productId={product.id} isActive={product.isActive} />
          </section>
        </article>

        {/* Product Details Section */}
        <section className="mt-16 max-w-7xl mx-auto" aria-labelledby="product-details-heading">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <h2 id="product-details-heading" className="sr-only">Product Details</h2>

            {/* Benefits Section */}
            <div className="border-b border-gray-200">
              <button 
                className="w-full px-6 py-8 text-left flex items-center justify-between transition-colors"
                aria-expanded="true"
                aria-controls="benefits-content"
                id="benefits-toggle"
              >
                <h3 className="text-lg font-semibold text-gray-900">BENEFITS</h3>
              </button>
              <div className="px-6 pb-8" id="benefits-content" aria-labelledby="benefits-toggle">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
                  {product.benefits && product.benefits.length > 0 ? (
                    product.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-3" role="listitem">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center" aria-hidden="true">
                          <Image
                            src={benefit.icon}
                            alt={benefit.title}
                            width={20}
                            height={20}
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">{benefit.title}</h4>
                          <p className="text-sm text-gray-600">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      <p>No benefits information available for this product.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* Customer Reviews Section */}
            <div>
              <div className=" py-4  grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* FAQs Section */}
                <div className="">
                  <div className="">
                    <button 
                      className="w-full px-6 py-4 text-left flex items-center justify-between transition-colors"
                      aria-expanded="true"
                      aria-controls="faqs-content"
                      id="faqs-toggle"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">FAQS</h3>
                    </button>
                    <div className="px-6 pb-4" id="faqs-content" aria-labelledby="faqs-toggle">
                      <div className="space-y-4" role="list">
                        {product.faqs && product.faqs.length > 0 ? (
                          product.faqs.map((faq, index) => (
                            <div key={index} role="listitem">
                              <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                              <p className="text-sm text-gray-600">
                                {faq.answer}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            <p>No FAQs available for this product.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>


                <div className="">
                  {/* Rating Summary */}

                  <h3 className="text-lg uppercase font-semibold text-gray-900 mb-4">Customer Reviews</h3>

                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <svg key={index} className="h-5 w-5" viewBox="0 0 24 24" fill="#FFC107" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-lg font-medium">4.79 out of 5</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Based on 34 reviews</p>

                    {/* Rating Breakdown */}
                    <div className="space-y-2">
                      {[
                        { stars: 5, count: 27, percentage: 79 },
                        { stars: 4, count: 7, percentage: 21 },
                        { stars: 3, count: 0, percentage: 0 },
                        { stars: 2, count: 0, percentage: 0 },
                        { stars: 1, count: 0, percentage: 0 }
                      ].map((rating) => (
                        <div key={rating.stars} className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <svg
                                key={index}
                                className="h-3 w-3"
                                viewBox="0 0 24 24"
                                fill={index < rating.stars ? "#FFC107" : "#E0E0E0"}
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                              </svg>
                            ))}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-lime-600 h-2 rounded-full"
                              style={{ width: `${rating.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-600 w-6">{rating.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>


                </div>


              </div>
            </div>
          </div>
        </section>

        <section className="mt-16" aria-label="Featured Products">
          <FeaturedProducts products={featuredProducts} />
        </section>
      </main>

      <Footer />
    </>
  );
}