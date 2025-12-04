import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'user' },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'product' },
        quantity: { type: Number, required: true }
    }],
    amount: { type: Number, required: true },
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'address', required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'],
        default: 'Pending' 
    },
    date: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Online', 'COD'], required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
})

const Order = mongoose.models.order || mongoose.model('order', orderSchema)

export default Order