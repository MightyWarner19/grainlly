import connectDB from "@/config/db"
import Address from "@/models/Address"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request) {
    try {
        
        const { userId } = getAuth(request)
        const {address} = await request.json()

        await connectDB()
        const newAddress = await Address.create({...address,userId})

        return NextResponse.json({ success: true, message: "Address added successfully", newAddress })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
export async function DELETE(request) {
    try {
        const { userId } = getAuth(request)
        const {addressId} = await request.json()

        await connectDB()
        const deletedAddress = await Address.findByIdAndDelete(addressId,{userId})

        return NextResponse.json({ success: true, message: "Address deleted successfully", deletedAddress })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}


