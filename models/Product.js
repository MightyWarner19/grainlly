import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: "user" },
    name: { type: String, required: true },
    slug: { type: String, required: false, unique: true, index: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    date: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    brand: { type: String, default: 'Grainlly Foods' },
    color: { type: String, default: '' },
    weight: { type: String, default: '' },
    unit: { type: String, default: '' },
    stock: { type: Number, default: 0 },
    sku: { type: String, default: '' },
    benefits: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, required: true } 
    }],
    faqs: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
    }]
})

const Product = mongoose.models.product || mongoose.model('product',productSchema)

export default Product