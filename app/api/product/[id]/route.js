import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";
import { getAuth } from '@clerk/nextjs/server';
import authSeller from "@/lib/authSeller";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// PUT - Update a product
export async function PUT(req, { params }) {
  try {
    console.log('=== UPDATE PRODUCT API CALLED ===');
    const { userId } = getAuth(req);
    console.log('User ID:', userId);
    
    const isSeller = await authSeller(userId);
    console.log('Is seller:', isSeller);
    
    if (!isSeller) {
      console.log('Authorization failed - not a seller');
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const { id } = await params;
    console.log('Product ID to update:', id);
    
    const contentType = req.headers.get('content-type');
    console.log('Content type:', contentType);

    let updateData = {};
    // helper to slugify
    const makeSlug = (str) =>
      String(str)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    // Check if it's FormData (with images) or JSON (without images)
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData with images
      const formData = await req.formData();

      // Required fields
      const name = formData.get('name');
      const shortDescription = formData.get('shortDescription') || undefined;
      const description = formData.get('description');
      const category = formData.get('category');
      const price = formData.get('price');
      const offerPrice = formData.get('offerPrice');

      // Optional additional details
      const rating = formData.get('rating') || 0;
      const brand = formData.get('brand') || 'Generic';
      const color = formData.get('color') || '';
      const weight = formData.get('weight') || '';
      const unit = formData.get('unit') || 'kg';
      const stock = formData.get('stock') || 0;
      const sku = formData.get('sku') || '';
      const benefitsData = formData.get('benefits');
      const faqsData = formData.get('faqs');

      updateData = {
        name,
        ...(shortDescription !== undefined ? { shortDescription } : {}),
        description,
        category,
        price: Number(price),
        offerPrice: Number(offerPrice),
        rating: Number(rating),
        brand,
        color,
        weight,
        unit,
        stock: Number(stock),
        sku
      };

      // Handle benefits and benefit icons
      if (benefitsData) {
        try {
          console.log('Raw benefits data:', benefitsData);
          const parsedBenefits = JSON.parse(benefitsData);
          console.log('Parsed benefits:', parsedBenefits);
          
          // Upload benefit icons to Cloudinary
          const benefits = await Promise.all(
            parsedBenefits.map(async (benefit, index) => {
              if (benefit.iconIndex !== undefined) {
                // This benefit has a new icon file to upload
                const iconFile = formData.get(`benefitIcon_${benefit.iconIndex}`);
                if (iconFile) {
                  const arrayBuffer = await iconFile.arrayBuffer();
                  const buffer = Buffer.from(arrayBuffer);
                  
                  const iconResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                      { 
                        resource_type: 'image',
                        folder: 'benefit-icons',
                        transformation: [
                          { width: 128, height: 128, crop: 'limit' },
                          { quality: 'auto', fetch_format: 'auto' }
                        ]
                      },
                      (error, result) => {
                        if (error) {
                          reject(error);
                        } else {
                          resolve(result);
                        }
                      }
                    );
                    stream.end(buffer);
                  });
                  
                  return {
                    title: benefit.title,
                    description: benefit.description,
                    icon: iconResult.secure_url
                  };
                }
              }
              
              // Return benefit with existing icon URL
              return {
                title: benefit.title,
                description: benefit.description,
                icon: benefit.icon || ''
              };
            })
          );
          
          updateData.benefits = benefits;
          console.log('Final benefits to update:', benefits);
        } catch (error) {
          console.error('Error processing benefits:', error);
        }
      }

      // Handle FAQs
      if (faqsData) {
        try {
          console.log('Raw FAQs data received:', faqsData);
          const faqs = JSON.parse(faqsData);
          console.log('Parsed FAQs:', faqs);
          console.log('FAQs count:', faqs.length);
          updateData.faqs = faqs;
        } catch (error) {
          console.error('Error parsing FAQs:', error);
        }
      } else {
        console.log('No FAQs data received in FormData');
      }

      // If name present, compute a unique slug
      if (name) {
        const baseSlug = makeSlug(name);
        let slug = baseSlug || `product-${Date.now()}`;
        let i = 1;
        // ensure uniqueness excluding current id
        // eslint-disable-next-line no-constant-condition
        while (await Product.findOne({ slug, _id: { $ne: id } })) {
          slug = `${baseSlug}-${i++}`;
        }
        updateData.slug = slug;
      }

      // Handle existing images if no new images are uploaded
      const existingImages = formData.getAll('existingImages');
      const files = formData.getAll('images');
      
      if (existingImages.length > 0 && (!files || files.length === 0 || files[0].size === 0)) {
        // If we have existing images and no new files, use the existing images
        updateData.image = existingImages.filter(img => img);
      } else if (files && files.length > 0 && files[0].size > 0) {
        // Handle new image uploads
        const result = await Promise.all(
          files.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            return new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto' },
                (error, result) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(result);
                  }
                }
              );
              stream.end(buffer);
            });
          })
        );

        // Get secure URLs of uploaded images
        const imageUrls = result.map((res) => res.secure_url);
        
        // If there are existing images and new ones, combine them
        if (existingImages.length > 0) {
          updateData.image = [...existingImages.filter(img => img), ...imageUrls];
        } else {
          updateData.image = imageUrls;
        }
      }
    } else {
      // Handle JSON data (simple update without images)
      updateData = await req.json();

      // Support shortDescription and slug generation if name provided
      if (updateData && updateData.name) {
        const baseSlug = makeSlug(updateData.name);
        let slug = baseSlug || `product-${Date.now()}`;
        let i = 1;
        while (await Product.findOne({ slug, _id: { $ne: id } })) {
          slug = `${baseSlug}-${i++}`;
        }
        updateData.slug = slug;
      }
    }

    console.log('Final updateData before database update:', JSON.stringify(updateData, null, 2));

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      console.log('Product not found with ID:', id);
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    console.log('Product updated successfully:', updatedProduct._id);
    console.log('Updated benefits count:', updatedProduct.benefits?.length || 0);
    console.log('Updated FAQs count:', updatedProduct.faqs?.length || 0);

    return NextResponse.json({ 
      success: true, 
      message: "Product updated successfully",
      product: updatedProduct 
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Product deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
