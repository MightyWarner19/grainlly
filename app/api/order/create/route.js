import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/emailService";



export async function POST(request) {
    try {

        const { userId } = getAuth(request)
        const { address, items, paymentMethod, razorpayOrderId, razorpayPaymentId } = await request.json();

        if (!address || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid data' });
        }

        if (!paymentMethod || !['Online', 'COD'].includes(paymentMethod)) {
            return NextResponse.json({ success: false, message: 'Invalid payment method' });
        }

        await connectDB()

        // calculate amount using items (fix async reduce)
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return NextResponse.json({ success: false, message: 'Invalid product in cart' });
            }
            amount += (product.offerPrice ?? product.price) * item.quantity;
        }
        const totalAmount = amount + Math.floor(amount * 0.02);

        // create order directly so it works even if Inngest worker isn't running
        const orderDoc = await Order.create({
            userId,
            address,
            items,
            amount: totalAmount,
            date: Date.now(),
            paymentMethod,
            paymentStatus: paymentMethod === 'Online' ? 'Paid' : 'Pending',
            razorpayOrderId: razorpayOrderId || undefined,
            razorpayPaymentId: razorpayPaymentId || undefined,
        })

        // still emit event for any async processing
        await inngest.send({
            name: 'order/created',
            data: {
                userId,
                address,
                items,
                amount: totalAmount,
                date: orderDoc.date,
            }
        })

        // clear user cart
        const user = await User.findById(userId)
        if (user) {
            user.cartItems = {}
            await user.save()
        }

        // Populate order with product and address details for email
        const populatedOrder = await Order.findById(orderDoc._id)
            .populate('items.product')
            .populate('address');

        // Prepare product details for email
        const productDetails = populatedOrder.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.offerPrice ?? item.product.price,
            total: (item.product.offerPrice ?? item.product.price) * item.quantity,
        }));

        // Get Clerk user details for email
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        const userEmail = clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId)?.emailAddress;
        const userName = clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : clerkUser.username || 'Customer';

        // Send order confirmation email to customer
        try {
            await sendOrderConfirmationEmail(
                userEmail,
                userName,
                populatedOrder,
                populatedOrder.address,
                productDetails
            );
        } catch (emailError) {
            console.error('Failed to send customer email:', emailError);
            // Don't fail the order if email fails
        }

        // Send order notification to admin
        try {
            await sendAdminOrderNotification(
                userEmail,
                userName,
                populatedOrder,
                populatedOrder.address,
                productDetails
            );
        } catch (emailError) {
            console.error('Failed to send admin notification:', emailError);
            // Don't fail the order if admin email fails
        }

        return NextResponse.json({ success: true, message: 'Order Placed', orderId: orderDoc._id })

    } catch (error) {
        console.log(error)
        return NextResponse.json({ success: false, message: error.message })
    }
}