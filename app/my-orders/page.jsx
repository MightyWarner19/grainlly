'use client';
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";

import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import FeedbackDialog from "@/components/FeedbackDialog";

const MyOrders = () => {

    const { currency, getToken, user, router } = useAppContext();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedbackDialog, setFeedbackDialog] = useState({
        isOpen: false,
        product: null,
        orderId: null
    });
    const fetchOrders = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/order/list', { 
                headers: { Authorization: `Bearer ${token}` },
                params: { t: new Date().getTime() } // Prevent caching
            });

            if (data.success) {
                setOrders(data.orders.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }

    // Fetch orders when component mounts and when user changes
    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const paymentBadgeStyles = useMemo(() => ({
        Paid: "bg-emerald-100 text-emerald-700",
        Pending: "bg-amber-100 text-amber-700",
        Failed: "bg-rose-100 text-rose-700",
    }), []);

    const statusOptions = [
        { value: 'Pending', label: 'Order Placed', color: 'bg-blue-100 text-blue-700' },
        { value: 'Confirmed', label: 'Order Confirmed', color: 'bg-indigo-100 text-indigo-700' },
        { value: 'Processing', label: 'Order Processing', color: 'bg-purple-100 text-purple-700' },
        { value: 'Shipped', label: 'Order Shipped', color: 'bg-sky-100 text-sky-700' },
        { value: 'Out for Delivery', label: 'Out for Delivery', color: 'bg-amber-100 text-amber-700' },
        { value: 'Delivered', label: 'Order Delivered', color: 'bg-green-100 text-green-700' },
        { value: 'Cancelled', label: 'Order Cancelled', color: 'bg-rose-100 text-rose-700' },
        { value: 'Returned', label: 'Order Returned', color: 'bg-red-100 text-red-700' },
        { value: 'Refunded', label: 'Order Refunded', color: 'bg-red-100 text-red-700' },
    ];

    const statusBadgeStyles = useMemo(() => {
        const styles = {};
        statusOptions.forEach(option => {
            styles[option.value] = option.color;
        });
        return styles;
    }, [statusOptions]);

    const statusText = (status) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option ? option.label : status;
    };

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
                <div className="max-w-5xl mx-auto w-full space-y-5">
                    <h2 className="text-lg md:text-xl font-semibold mt-6 text-gray-800">My Orders</h2>

                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <Loading />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="border border-dashed border-gray-300 rounded-2xl bg-white py-16 text-center space-y-4">
                            <p className="font-medium text-lg text-gray-600">You have no orders yet.</p>
                            <button
                                onClick={() => router.push('/all-products')}
                                className="px-6 py-2.5 bg-lime-700 text-white rounded-full hover:bg-lime-700/90 transition"
                            >
                                Shop Now
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const firstProduct = order.items?.[0]?.product;
                                const productSummary = order.items
                                    ?.map((item) => {
                                        const productName = item.product?.name || 'Product removed';
                                        return `${productName} × ${item.quantity}`;
                                    })
                                    .join(', ');

                                const paymentStatus = order.paymentStatus || 'Pending';
                                const paymentStyle = paymentBadgeStyles[paymentStatus] || paymentBadgeStyles.Pending;
                                const orderStatus = order.status || 'Pending';
                                const statusStyle = statusBadgeStyles[orderStatus] || "bg-gray-100 text-gray-600";

                                return (
                                    <div
                                        key={order._id}
                                        className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6 space-y-6"
                                    >
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="flex gap-4 md:gap-5">
                                                {firstProduct && firstProduct.image?.[0] ? (
                                                    <Image
                                                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
                                                        src={firstProduct.image[0]}
                                                        alt={firstProduct.name || 'Product'}
                                                        width={80}
                                                        height={80}
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-400">
                                                        No Image
                                                    </div>
                                                )}

                                                <div className="space-y-1">
                                                    <p className="text-base md:text-lg font-semibold text-gray-900 leading-tight">
                                                        {productSummary}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                                                    </p>
                                                    <p className="text-xs text-gray-400">Order ID · {order._id}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md ${statusStyle} whitespace-nowrap`}>
                                                    {statusText(orderStatus)}
                                                </span>
                                                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium  ${paymentStyle}`}>
                                                    Payment · {paymentStatus} {order.paymentMethod}
                                                </span>
                                                <div className="text-right min-w-[120px]">
                                                    <p className="text-xs uppercase tracking-wide text-gray-400">Order Total</p>
                                                    <p className="text-xl font-semibold text-gray-900">{currency}{Number(order.amount).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div className="space-y-1">
                                                <p className="text-xs uppercase tracking-wide text-gray-400">Payment Details</p>
                                                <p className="font-semibold text-gray-900">Method · {order.paymentMethod || 'COD'}</p>
                                                {order.paymentMethod === 'Online' && (
                                                    <>
                                                        <p>Payment ID · {order.razorpayPaymentId || '—'}</p>
                                                        <p>Order Ref · {order.razorpayOrderId || '—'}</p>
                                                    </>
                                                )}
                                                <p>Payment Status · {paymentStatus}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs uppercase tracking-wide text-gray-400">Shipping Address</p>
                                                <p className="font-medium text-gray-900">{order.address.fullName}</p>
                                                <p>{order.address.phoneNumber}</p>
                                                <p>{order.address.area}</p>
                                                <p>{`${order.address.city}, ${order.address.state} - ${order.address.pincode}`}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs uppercase tracking-wide text-gray-400">Order Timeline</p>
                                                <p>Placed · {new Date(order.date).toLocaleString()}</p>
                                                <p>Items · {order.items?.length || 0}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200 flex flex-col md:flex-row gap-3">
                                            {/* Share Review Button - Show for all orders for now (can be restricted to delivered later) */}
                                            {/* <button
                                                onClick={() => {
                                                    console.log('Feedback button clicked:', { firstProduct, orderId: order._id });
                                                    setFeedbackDialog({
                                                        isOpen: true,
                                                        product: firstProduct,
                                                        orderId: order._id
                                                    });
                                                }}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition font-medium"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                                Share Your Review
                                            </button> */}
                                            
                                            <button
                                                onClick={() => {
                                                    const productImage = firstProduct?.image?.[0] || '';
                                                    const message = `Hi, I have a query regarding my order:\n\nOrder ID: ${order._id}\nProducts: ${productSummary}\nOrder Amount: ${currency}${Number(order.amount).toFixed(2)}\nOrder Date: ${new Date(order.date).toLocaleDateString()}\n\n${productImage ? `Product Image: ${productImage}\n\n` : ''}Please help me with this order.`;
                                                    const whatsappUrl = `https://wa.me/916387518837?text=${encodeURIComponent(message)}`;
                                                    window.open(whatsappUrl, '_blank');
                                                }}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                </svg>
                                                Contact Seller on WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
            
            {/* Feedback Dialog */}
            <FeedbackDialog
                isOpen={feedbackDialog.isOpen}
                onClose={() => setFeedbackDialog({ isOpen: false, product: null, orderId: null })}
                product={feedbackDialog.product}
                orderId={feedbackDialog.orderId}
            />
        </>
    );
};

export default MyOrders;