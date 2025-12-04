import React, { Suspense } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import connectDB from "@/config/db";
import Blog from "@/models/Blog";

export const metadata = {
  title: "Blog | Grainlly E-Commerce",
  description: "Read the latest from Grainlly.",
};

export const revalidate = 0; // Force dynamic rendering for immediate updates

const formatDate = (isoString) =>
  isoString
    ? new Date(isoString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

async function getPosts() {
  await connectDB();

  const docs = await Blog.find({ status: "Published" })
    .sort({ createdAt: -1 })
    .lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    image: doc.image || "/blog-placeholder.png",
    author: doc.author || "Team Grainlly",
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
  }));
}

async function BlogGrid() {
  const posts = await getPosts();

  if (!posts.length) {
    return (
      <div className="py-16 text-center border border-dashed border-gray-300 rounded-2xl bg-white">
        <h2 className="text-xl font-semibold text-gray-800">No blog posts yet</h2>
        <p className="mt-2 text-gray-500 text-sm">Please check back soon for the latest stories from Grainlly.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <article
          key={post.id}
          className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <Link href={`/blog/${post.slug}`} className="block relative aspect-[4/3] bg-gray-100">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          </Link>
          <div className="p-5 space-y-3">
            <div className="text-xs uppercase tracking-wide text-lime-700 font-medium">
              {post.createdAt ? formatDate(post.createdAt) : ""}
            </div>
            <Link href={`/blog/${post.slug}`} className="block">
              <h2 className="text-lg 高升 font-semibold text-gray-900 leading-snug line-clamp-2">
                {post.title}
              </h2>
            </Link>
            <p className="text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
            <div className="text-xs text-gray-500">By {post.author}</div>
            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-lime-700 hover:gap-2 transition-all"
            >
              Read more
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="px-6 md:px-16 lg:px-32 py-10">
        <header className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Blog</h1>
            <p className="mt-2 text-gray-600">Stories and insights from Grainlly.</p>
          </div>
        </header>

        <section className="mt-8">
          <Suspense fallback={<div className="py-10 text-center text-gray-500">Loading posts…</div>}>
            <BlogGrid />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}

