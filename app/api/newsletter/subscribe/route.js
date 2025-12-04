import connectDB from "@/config/db";
import Newsletter from "@/models/Newsletter";
import { NextResponse } from "next/server";

// Subscribe to newsletter (Public)
export async function POST(request) {
    try {
        await connectDB();

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email is required" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingSubscriber = await Newsletter.findOne({ email });

        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return NextResponse.json(
                    { success: false, message: "This email is already subscribed" },
                    { status: 400 }
                );
            } else {
                // Reactivate subscription
                existingSubscriber.isActive = true;
                existingSubscriber.subscribedAt = Date.now();
                await existingSubscriber.save();
                
                return NextResponse.json({
                    success: true,
                    message: "Welcome back! Your subscription has been reactivated"
                });
            }
        }

        // Create new subscriber
        const newSubscriber = await Newsletter.create({ email });

        return NextResponse.json({
            success: true,
            message: "Successfully subscribed to newsletter!",
            subscriber: newSubscriber
        });

    } catch (error) {
        console.error("Newsletter subscription error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to subscribe" },
            { status: 500 }
        );
    }
}
