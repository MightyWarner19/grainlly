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

// GET single testimonial
export async function GET(request, { params }) {
    try {
        const { id } = params

        await connectDB()

        const testimonial = await Testimonial.findById(id)

        if (!testimonial) {
            return NextResponse.json({ 
                success: false, 
                message: 'Testimonial not found' 
            })
        }

        return NextResponse.json({ 
            success: true, 
            testimonial 
        })

    } catch (error) {
        console.error('Error fetching testimonial:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        })
    }
}

// UPDATE testimonial
export async function PUT(request, { params }) {
    try {
        const { userId } = getAuth(request)
        const isSeller = await authSeller(userId)

        if (!isSeller) {
            return NextResponse.json({ success: false, message: 'not authorized' })
        }

        const { id } = params
        const formData = await request.formData()

        await connectDB()

        const testimonial = await Testimonial.findById(id)

        if (!testimonial) {
            return NextResponse.json({ 
                success: false, 
                message: 'Testimonial not found' 
            })
        }

        const name = formData.get('name');
        const role = formData.get('role') || '';
        const rating = formData.get('rating') || 5;
        const comment = formData.get('comment');
        const order = formData.get('order') || 0;
        const isActive = formData.get('isActive') === 'true';

        let avatarUrl = formData.get('avatarUrl') || testimonial.avatar;

        // Handle avatar upload if new file is provided
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

        testimonial.name = name || testimonial.name;
        testimonial.role = role;
        testimonial.rating = Number(rating);
        testimonial.comment = comment || testimonial.comment;
        testimonial.avatar = avatarUrl;
        testimonial.isActive = isActive;
        testimonial.order = Number(order);

        await testimonial.save()

        return NextResponse.json({ 
            success: true, 
            message: 'Testimonial updated successfully',
            testimonial 
        })

    } catch (error) {
        console.error('Error updating testimonial:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        })
    }
}

// DELETE testimonial
export async function DELETE(request, { params }) {
    try {
        const { userId } = getAuth(request)
        const isSeller = await authSeller(userId)

        if (!isSeller) {
            return NextResponse.json({ success: false, message: 'not authorized' })
        }

        const { id } = params

        await connectDB()

        const testimonial = await Testimonial.findByIdAndDelete(id)

        if (!testimonial) {
            return NextResponse.json({ 
                success: false, 
                message: 'Testimonial not found' 
            })
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Testimonial deleted successfully' 
        })

    } catch (error) {
        console.error('Error deleting testimonial:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        })
    }
}
