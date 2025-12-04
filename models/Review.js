import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: "user" },
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "product" },
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, default: '' },
    likedAspects: [{ type: String }], // Array of liked aspects
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: true },
    date: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Compound index to ensure one review per user per product per order
reviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

const Review = mongoose.models.review || mongoose.model('review', reviewSchema);

export default Review;
