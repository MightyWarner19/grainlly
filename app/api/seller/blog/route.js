import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/config/db";
import Blog from "@/models/Blog";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET - Fetch all blog posts
export async function GET(req) {
  try {
    await connectDB();
    
    const posts = await Blog.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

// POST - Create a new blog post
export async function POST(req) {
  try {
    await connectDB();
    
    const formData = await req.formData();
    
    const title = formData.get('title');
    const slug = formData.get('slug');
    const excerpt = formData.get('excerpt');
    const content = formData.get('content');
    const status = formData.get('status');
    const author = formData.get('author');
    const imageFile = formData.get('image');

    // Validate required fields
    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { error: "Title, excerpt, and content are required" },
        { status: 400 }
      );
    }

    // Create slug from title if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingPost = await Blog.findOne({ slug: finalSlug });
    if (existingPost) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 400 }
      );
    }

    // Upload image to Cloudinary if provided
    let imageUrl = "/blog-placeholder.png";
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'blog' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      imageUrl = result.secure_url;
    }

    const newPost = await Blog.create({
      title,
      slug: finalSlug,
      excerpt,
      content,
      image: imageUrl,
      status: status || "Draft",
      author: author || "Team Grainlly",
    });

    // Revalidate blog pages to show new post immediately
    revalidatePath('/blog');
    if (newPost.status === 'Published') {
      revalidatePath(`/blog/${newPost.slug}`);
    }

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create blog post" },
      { status: 500 }
    );
  }
}
