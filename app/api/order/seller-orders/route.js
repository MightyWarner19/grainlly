import connectDB from "@/config/db";
import Address from "@/models/Address";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { NextResponse } from "next/server";



export async function GET(request) {
    try {
        
        // const {userId} = getAuth(request)

        await connectDB()

        await Address.length
        await Product.length

        // Get pagination parameters from query string
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const all = searchParams.get('all') === 'true'; // Check if we want all orders
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalOrders = await Order.countDocuments();

        // Fetch orders with or without pagination
        let ordersQuery = Order.find()
            .populate('address items.product')
            .sort({ date: -1 }); // Sort by newest first
            
        if (!all) {
            // Apply pagination only if not requesting all orders
            ordersQuery = ordersQuery.skip(skip).limit(limit);
        }
        
        const orders = await ordersQuery;

        return NextResponse.json({ 
            success: true, 
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit),
                totalOrders,
                ordersPerPage: limit,
                hasNextPage: page < Math.ceil(totalOrders / limit),
                hasPrevPage: page > 1
            }
        })

    } catch (error) {
        return NextResponse.json({ success:false, message:error.message })
    }
}