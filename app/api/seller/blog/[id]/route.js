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

// PUT - Update a blog post
export async function PUT(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Validate ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid blog post ID" },
        { status: 400 }
      );
    }
    
    const formData = await req.formData();
    
    const title = formData.get('title');
    const slug = formData.get('slug');
    const excerpt = formData.get('excerpt');
    const content = formData.get('content');
    const status = formData.get('status');
    const author = formData.get('author');
    const imageFile = formData.get('image');
    const existingImage = formData.get('existingImage');
    const removeImage = formData.get('removeImage'); // New field to handle image removal
    
    console.log('Update request for ID:', id);
    console.log('Form data received:', { title, slug, excerpt, status, author, removeImage });

    // Validate required fields
    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { error: "Title, excerpt, and content are required" },
        { status: 400 }
      );
    }

    // Get the current post to compare slug changes
    const currentPost = await Blog.findById(id);
    if (!currentPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }
    
    // If slug is being updated and is different from current, check for duplicates
    if (slug && slug !== currentPost.slug) {
      const existingPost = await Blog.findOne({ slug, _id: { $ne: id } });
      if (existingPost) {
        return NextResponse.json(
          { error: "A post with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Handle image logic
    let imageUrl = "/blog-placeholder.png"; // Default image
    
    if (imageFile && imageFile.size > 0) {
      // New image uploaded - use the new image
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
    } else if (removeImage === 'true') {
      // Image explicitly removed - use default image
      imageUrl = "/blog-placeholder.png";
    } else if (existingImage) {
      // Keep existing image
      imageUrl = existingImage;
    }

    const updatedPost = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        slug,
        excerpt,
        content,
        image: imageUrl,
        status,
        author,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Revalidate blog pages to show immediate updates
    revalidatePath('/blog');
    revalidatePath(`/blog/${updatedPost.slug}`);

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update blog post" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a blog post
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;

    const deletedPost = await Blog.findByIdAndDelete(id);

    if (!deletedPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Blog post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
