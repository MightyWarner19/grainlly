import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Testimonial from "@/models/Testimonial";

export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const activeOnly = searchParams.get('activeOnly') === 'true'

        let query = {}
        if (activeOnly) {
            query.isActive = true
        }

        const testimonials = await Testimonial.find(query).sort({ order: 1, date: -1 })

        return NextResponse.json({ 
            success: true, 
            testimonials 
        })

    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        })
    }
}
