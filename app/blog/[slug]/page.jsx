import React from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import connectDB from "@/config/db";
import Blog from "@/models/Blog";

export const revalidate = 0; // Force dynamic rendering for immediate updates

async function getPostBySlug(slug) {
  await connectDB();

  const doc = await Blog.findOne({ slug, status: "Published" }).lean();
  if (!doc) return null;

  return {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    content: doc.content,
    image: doc.image || "/blog-placeholder.png",
    author: doc.author || "Team Grainlly",
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
  };
}

export async function generateStaticParams() {
  await connectDB();
  const docs = await Blog.find({ status: "Published" }, "slug").lean();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Post Not Found | Grainlly" };
  }
  return {
    title: `${post.title} | Grainlly Blog`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | Grainlly Blog`,
      description: post.excerpt,
      images: post.image ? [{ url: post.image }] : [],
    },
  };
}

const formatDate = (isoString) =>
  isoString
    ? new Date(isoString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <>
      <Navbar />
      <main className="px-6 md:px-16 lg:px-32 py-10">
        <article className="max-w-3xl mx-auto">
          <header>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">{post.title}</h1>
            <p className="mt-2 text-sm text-gray-500">
              {post.createdAt ? `${formatDate(post.createdAt)} · ` : ""}
              {post.author}
            </p>
            {post.image && (
              <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
                <Image src={post.image} alt={post.title} width={1200} height={800} className="w-full h-auto" />
              </div>
            )}
          </header>
         

          <div className="prose prose-slate max-w-none mt-6" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>
      <Footer />
    </>
  );
}
