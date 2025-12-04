import connectDB from "@/config/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find({}).sort({ date: -1 });
        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const name = (body?.name || "").trim();
        if (!name) {
            return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
        }
        const exists = await Category.findOne({ name });
        if (exists) {
            return NextResponse.json({ success: false, message: 'Category already exists' }, { status: 409 });
        }
        const category = await Category.create({ name, date: Date.now() });
        return NextResponse.json({ success: true, data: category }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}