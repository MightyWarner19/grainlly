import { v2 as cloudinary } from "cloudinary";
import { getAuth } from '@clerk/nextjs/server'
import authSeller from "@/lib/authSeller";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";


// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


export async function POST(request) {
    try {
        
        const { userId } = getAuth(request)

        const isSeller = await authSeller(userId)

        if (!isSeller) {
            return NextResponse.json({ success: false, message: 'not authorized' })
        }

        const formData = await request.formData()

        // Required fields
        const name = formData.get('name');
        const shortDescription = formData.get('shortDescription') || '';
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

        console.log('Rating received:', rating, 'Type:', typeof rating);

        const files = formData.getAll('images');

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, message: 'no files uploaded' })
        }

        const result = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                return new Promise((resolve,reject)=>{
                    const stream = cloudinary.uploader.upload_stream(
                        {resource_type: 'auto'},
                        (error,result) => {
                            if (error) {
                                reject(error)
                            } else {
                                resolve(result)
                            }
                        }
                    )
                    stream.end(buffer)
                })
            })
        )

        const image = result.map(result => result.secure_url)

        // Handle benefits and benefit icons
        let benefits = [];
        if (benefitsData) {
            try {
                const parsedBenefits = JSON.parse(benefitsData);
                
                // Upload benefit icons to Cloudinary
                benefits = await Promise.all(
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
                        
                        // Return benefit with existing icon URL or without icon
                        return {
                            title: benefit.title,
                            description: benefit.description,
                            icon: benefit.icon || ''
                        };
                    })
                );
            } catch (error) {
                console.error('Error processing benefits:', error);
                benefits = [];
            }
        }

        // Handle FAQs
        let faqs = [];
        if (faqsData) {
            try {
                console.log('Raw FAQs data received:', faqsData);
                faqs = JSON.parse(faqsData);
                console.log('Parsed FAQs:', faqs);
                console.log('FAQs count:', faqs.length);
            } catch (error) {
                console.error('Error parsing FAQs:', error);
                faqs = [];
            }
        } else {
            console.log('No FAQs data received in FormData');
        }

        await connectDB()

        // generate unique slug from name
        const makeSlug = (str) =>
            String(str)
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-");

        const baseSlug = makeSlug(name || "");
        let slug = baseSlug || `product-${Date.now()}`;
        let i = 1;
        // ensure uniqueness
        while (await Product.findOne({ slug })) {
            slug = `${baseSlug}-${i++}`;
        }

        const newProduct = await Product.create({
            userId,
            name,
            slug,
            shortDescription,
            description,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            image,
            date: Date.now(),
            // Optional fields
            rating: Number(rating),
            brand,
            color,
            weight,
            unit,
            stock: Number(stock),
            sku,
            benefits,
            faqs
        })

        console.log('Product created with rating:', newProduct.rating);
        console.log('Product created with FAQs count:', newProduct.faqs?.length || 0);
        console.log('Product created with Benefits count:', newProduct.benefits?.length || 0);

        return NextResponse.json({ success: true, message: 'Upload successful', newProduct })


    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ success: false, message: error.message })
    }
}