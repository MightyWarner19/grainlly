import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: "user" },
    name: { type: String, required: true },
    role: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    date: { type: Number, required: true },
    order: { type: Number, default: 0 }
})

const Testimonial = mongoose.models.testimonial || mongoose.model('testimonial', testimonialSchema)

export default Testimonial
