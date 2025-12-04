import connectDB from "@/config/db";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const { address } = await request.json();
    if (!address || !address._id) {
      return NextResponse.json({ success: false, message: "Invalid address payload" });
    }

    await connectDB();

    const { _id, ...updates } = address;
    const updated = await Address.findOneAndUpdate(
      { _id, userId },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: "Address not found" });
    }

    return NextResponse.json({ success: true, message: "Address updated successfully", address: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
