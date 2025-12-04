'use client';
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import axios from "axios";
import toast from "react-hot-toast";

const statusOptions = [
        { value: 'Pending', label: 'Order Placed', color: 'bg-blue-100 text-blue-700' },
        { value: 'Confirmed', label: 'Confirmed Order', color: 'bg-indigo-100 text-indigo-700' },
        { value: 'Processing', label: 'Processing Order', color: 'bg-purple-100 text-purple-700' },
        { value: 'Shipped', label: 'Shipped Order', color: 'bg-sky-100 text-sky-700' },
        { value: 'Out for Delivery', label: 'Out for Delivery Order', color: 'bg-amber-100 text-amber-700' },
        { value: 'Delivered', label: 'Delivered Order', color: 'bg-green-100 text-green-700' },
        { value: 'Cancelled', label: 'Cancelled Order', color: 'bg-rose-100 text-rose-700' },
        { value: 'Returned', label: 'Returned Order', color: 'bg-red-100 text-red-700' },
        { value: 'Refunded', label: 'Refunded Order', color: 'bg-red-100 text-red-700' },
];

const Orders = () => {
    const { currency, getToken, user } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalOrders: 0,
        ordersPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
    });
    
    const fetchSellerOrders = async (page = 1) => {
        try {
            setLoading(true);
            const token = await getToken();

            const { data } = await axios.get(
                `/api/order/seller-orders?page=${page}&limit=10`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                setOrders(data.orders);
                setPagination(data.pagination);
                setCurrentPage(page);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchSellerOrders(1);
        }
    }, [user]);

    const paymentBadgeStyles = useMemo(() => ({
        Paid: "bg-emerald-100 text-emerald-700",
        Pending: "bg-amber-100 text-amber-700",
        Failed: "bg-rose-100 text-rose-700",
    }), []);

    const statusBadgeStyles = useMemo(() => {
        const styles = {};
        statusOptions.forEach(option => {
            styles[option.value] = option.color;
        });
        return styles;
    }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = await getToken();
            const response = await fetch('/api/order/update-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId,
                    status: newStatus
                })
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success('Order status updated successfully');
                // Update the local state to reflect the change
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order._id === orderId 
                            ? { ...order, status: newStatus } 
                            : order
                    )
                );
            } else {
                throw new Error(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error(error.message || 'Failed to update order status');
        }
    };

    return (
        <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
            {loading ? (
                <Loading />
            ) : (
                <div className="md:p-10 p-4 space-y-5">
                    <h2 className="text-lg font-medium">Orders</h2>
                    <div className="space-y-4 max-w-5xl">
                        {orders.map((order) => {
                            const firstProduct = order.items?.[0]?.product;
                            const productSummary = order.items
                                ?.map((item) => {
                                    const productName = item.product?.name || 'Deleted Product';
                                    return `${productName} × ${item.quantity}`;
                                })
                                .join(', ');

                            const paymentStatus = order.paymentStatus || 'Pending';
                            const paymentStyle = paymentBadgeStyles[paymentStatus] || paymentBadgeStyles.Pending;
                            const orderStatus = order.status || 'Order Placed';
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
                                                <p className="text-xs text-gray-400">Customer · {order.address.fullName}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                            <div className="relative group">
                                                <select
                                                    value={orderStatus}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    className={`appearance-none inline-flex items-center px-3 w-40 py-1 text-xs font-medium ${statusStyle} rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                                >
                                                    {statusOptions.map((status) => (
                                                        <option 
                                                            key={status.value} 
                                                            value={status.value}
                                                            className="bg-white text-gray-900"
                                                        >
                                                            {status.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium ${paymentStyle}`}>
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
                                            <p>Status · {statusOptions.find(s => s.value === orderStatus)?.label || orderStatus}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => {
                                                const customerPhone = order.address.phoneNumber.replace(/\D/g, '');
                                                const productImage = firstProduct?.image?.[0] || '';
                                                const message = `Hello ${order.address.fullName},\n\nRegarding your order:\n\nOrder ID: ${order._id}\nProducts: ${productSummary}\nOrder Amount: ₹${Number(order.amount).toFixed(2)}\nOrder Date: ${new Date(order.date).toLocaleDateString()}\nDelivery Address: ${order.address.area}, ${order.address.city}\n\n${productImage ? `Product Image: ${productImage}\n\n` : ''}Thank you for shopping with Grainlly!`;
                                                const whatsappUrl = `https://wa.me/91${customerPhone}?text=${encodeURIComponent(message)}`;
                                                window.open(whatsappUrl, '_blank');
                                            }}
                                            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                            </svg>
                                            Contact Customer on WhatsApp
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    <div className="max-w-4xl mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalOrders}
                            itemsPerPage={pagination.ordersPerPage}
                            onPageChange={fetchSellerOrders}
                            hasNextPage={pagination.hasNextPage}
                            hasPrevPage={pagination.hasPrevPage}
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default Orders;