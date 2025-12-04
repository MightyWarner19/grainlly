import connectDB from "@/config/db";
import Newsletter from "@/models/Newsletter";
import { NextResponse } from "next/server";

// Get all newsletter subscribers (Admin)
export async function GET(request) {
    try {
        await connectDB();

        // Get pagination parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;
        const status = searchParams.get('status'); // 'active', 'inactive', or null for all

        // Build query
        let query = {};
        if (status === 'active') {
            query.isActive = true;
        } else if (status === 'inactive') {
            query.isActive = false;
        }

        // Get total count
        const totalSubscribers = await Newsletter.countDocuments(query);

        // Fetch subscribers with pagination
        const subscribers = await Newsletter.find(query)
            .sort({ subscribedAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            success: true,
            subscribers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalSubscribers / limit),
                totalSubscribers,
                subscribersPerPage: limit,
                hasNextPage: page < Math.ceil(totalSubscribers / limit),
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error("Error fetching subscribers:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// Delete subscriber (Admin)
export async function DELETE(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Subscriber ID is required" },
                { status: 400 }
            );
        }

        const deletedSubscriber = await Newsletter.findByIdAndDelete(id);

        if (!deletedSubscriber) {
            return NextResponse.json(
                { success: false, message: "Subscriber not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Subscriber deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting subscriber:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// Update subscriber status (Admin)
export async function PUT(request) {
    try {
        await connectDB();

        const { id, isActive } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Subscriber ID is required" },
                { status: 400 }
            );
        }

        const updatedSubscriber = await Newsletter.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!updatedSubscriber) {
            return NextResponse.json(
                { success: false, message: "Subscriber not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Subscriber ${isActive ? 'activated' : 'deactivated'} successfully`,
            subscriber: updatedSubscriber
        });

    } catch (error) {
        console.error("Error updating subscriber:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
