import connectDB from "@/config/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
    try {
        await connectDB();
        const { id } = params || {};
        const category = await Category.findById(id);
        if (!category) {
            return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: category });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        await connectDB();
        const { id } = params || {};
        const body = await request.json();
        const updates = {};
        if (typeof body?.name === 'string') {
            const name = body.name.trim();
            if (!name) {
                return NextResponse.json({ success: false, message: 'Name cannot be empty' }, { status: 400 });
            }
            const exists = await Category.findOne({ name, _id: { $ne: id } });
            if (exists) {
                return NextResponse.json({ success: false, message: 'Category already exists' }, { status: 409 });
            }
            updates.name = name;
        }
        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ success: false, message: 'No valid updates provided' }, { status: 400 });
        }
        const category = await Category.findByIdAndUpdate(id, updates, { new: true });
        if (!category) {
            return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: category });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(_req, { params }) {
    try {
        await connectDB();
        const { id } = params || {};
        const deleted = await Category.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}


