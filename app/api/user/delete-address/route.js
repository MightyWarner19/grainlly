import connectDB from "@/config/db";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const { addressId } = await request.json();
    if (!addressId) {
      return NextResponse.json({ success: false, message: "Address ID is required" });
    }

    await connectDB();

    const deleted = await Address.findOneAndDelete({ _id: addressId, userId });

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Address not found" });
    }

    return NextResponse.json({ success: true, message: "Address deleted successfully", address: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
