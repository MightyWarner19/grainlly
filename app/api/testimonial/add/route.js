import { v2 as cloudinary } from "cloudinary";
import { getAuth } from '@clerk/nextjs/server'
import authSeller from "@/lib/authSeller";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Testimonial from "@/models/Testimonial";

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

        const name = formData.get('name');
        const role = formData.get('role') || '';
        const rating = formData.get('rating') || 5;
        const comment = formData.get('comment');
        const order = formData.get('order') || 0;
        const isActive = formData.get('isActive') === 'true';

        if (!name || !comment) {
            return NextResponse.json({ success: false, message: 'Name and comment are required' })
        }

        let avatarUrl = formData.get('avatarUrl') || '';

        // Handle avatar upload if file is provided
        const avatarFile = formData.get('avatar');
        if (avatarFile && avatarFile.size > 0) {
            const arrayBuffer = await avatarFile.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { 
                        resource_type: 'auto',
                        folder: 'testimonials'
                    },
                    (error, result) => {
                        if (error) {
                            reject(error)
                        } else {
                            resolve(result)
                        }
                    }
                )
                stream.end(buffer)
            })

            avatarUrl = result.secure_url
        }

        await connectDB()

        const newTestimonial = await Testimonial.create({
            userId,
            name,
            role,
            rating: Number(rating),
            comment,
            avatar: avatarUrl,
            isActive,
            order: Number(order),
            date: Date.now()
        })

        return NextResponse.json({ 
            success: true, 
            message: 'Testimonial added successfully', 
            testimonial: newTestimonial 
        })

    } catch (error) {
        console.error('Error adding testimonial:', error);
        return NextResponse.json({ success: false, message: error.message })
    }
}
