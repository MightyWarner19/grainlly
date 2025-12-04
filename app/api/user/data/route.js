import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET(request) {
    
    try {
        
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" })
        }

        await connectDB()
        let user = await User.findById(userId)

        if (!user) {
            // Auto-provision a minimal user; details can be synced later via Inngest
            user = await User.create({
                _id: userId,
                email: `${userId}@placeholder.local`,
                name: "User",
                imageUrl: "https://placehold.co/96x96?text=User",
            })
        }
        return NextResponse.json({success:true, user})

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }

}