import connectDB from "@/config/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

// POST - Create a new review
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: "Unauthorized - Please login" 
            }, { status: 401 });
        }

        await connectDB();

        const { 
            productId, 
            orderId, 
            rating, 
            reviewText, 
            likedAspects, 
            userName, 
            userEmail 
        } = await request.json();

        // Validate required fields
        if (!productId || !orderId || !rating || !userName || !userEmail) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields"
            }, { status: 400 });
        }

        // Verify the order belongs to the user and contains the product
        const order = await Order.findOne({
            _id: orderId,
            userId: userId,
            'items.product': productId
        });

        if (!order) {
            return NextResponse.json({
                success: false,
                message: "Order not found or product not in this order"
            }, { status: 404 });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            userId,
            productId,
            orderId
        });

        if (existingReview) {
            return NextResponse.json({
                success: false,
                message: "You have already reviewed this product for this order"
            }, { status: 400 });
        }

        // Create new review
        const newReview = new Review({
            userId,
            productId,
            orderId,
            rating,
            reviewText: reviewText || '',
            likedAspects: likedAspects || [],
            userName,
            userEmail
        });

        await newReview.save();

        // Update product rating (calculate average)
        const allReviews = await Review.find({ productId, isActive: true });
        const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
        
        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
        });

        return NextResponse.json({
            success: true,
            message: "Review submitted successfully",
            review: newReview
        });

    } catch (error) {
        console.error('Review creation error:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

// GET - Get reviews for a product
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        if (!productId) {
            return NextResponse.json({
                success: false,
                message: "Product ID is required"
            }, { status: 400 });
        }

        // Get reviews for the product
        const reviews = await Review.find({ 
            productId, 
            isActive: true 
        })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

        const totalReviews = await Review.countDocuments({ 
            productId, 
            isActive: true 
        });

        // Calculate rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId), isActive: true } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        return NextResponse.json({
            success: true,
            reviews,
            totalReviews,
            ratingDistribution,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit),
                hasNextPage: page < Math.ceil(totalReviews / limit),
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}
