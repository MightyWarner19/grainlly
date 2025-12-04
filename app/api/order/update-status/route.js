import { NextResponse } from "next/server";
import Order from "@/models/Order";
import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";

export async function PUT(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { orderId, status } = await request.json();

        if (!orderId || !status) {
            return NextResponse.json(
                { success: false, message: 'Order ID and status are required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Validate status against the enum values
        const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, message: 'Invalid status value' },
                { status: 400 }
            );
        }

        // Update the order status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Order status updated successfully',
            order: updatedOrder
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to update order status' },
            { status: 500 }
        );
    }
}
