
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Script from "next/script";


const OrderSummary = () => {
  const { currency, router, getCartCount, getCartAmount, getToken, user, cartItems, setCartItems } = useAppContext();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    pincode: "",
    area: "",
    city: "",
    state: "",
  });

  // Indian States and Union Territories
  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh", 
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
  ];

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/get-address', { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const startEdit = (address) => {
    setEditingAddressId(address._id);
    setEditForm({
      fullName: address.fullName || "",
      phoneNumber: address.phoneNumber || "",
      pincode: String(address.pincode || ""),
      area: address.area || "",
      city: address.city || "",
      state: address.state || "",
    });
  };

  const cancelEdit = () => {
    setEditingAddressId(null);
    setEditForm({ fullName: "", phoneNumber: "", pincode: "", area: "", city: "", state: "" });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    try {
      const token = await getToken();
      const payload = { address: { _id: editingAddressId, ...editForm, pincode: Number(editForm.pincode) || editForm.pincode } };
      const { data } = await axios.put('/api/user/update-address', payload, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success(data.message);
        await fetchUserAddresses();
        // If updated one was selected, refresh selected reference
        if (selectedAddress && selectedAddress._id === editingAddressId) {
          const refreshed = data.address;
          setSelectedAddress(refreshed);
        }
        cancelEdit();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };



  const deleteAddress = async (addressId) => {
    try {
      const token = await getToken();
      const { data } = await axios.delete('/api/user/delete-address', { data: { addressId }, headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success(data.message);
        await fetchUserAddresses();
        if (selectedAddress && selectedAddress._id === addressId) {
          setSelectedAddress(null);
        }
        if (editingAddressId === addressId) {
          cancelEdit();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Validate MongoDB ObjectId format (24 character hex string)
  const isValidObjectId = (id) => {
    return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
  };

  const handlePayment = async () => {
    if (paymentMethod === 'Online') {
      await handleOnlinePayment();
    } else {
      await handleCODPayment();
    }
  };

  const handleOnlinePayment = async () => {
    try {
      if (!user) {
        return toast('Please login to place order', { icon: '⚠️' });
      }

      if (!selectedAddress) {
        return toast.error('Please select an address');
      }

      let cartItemsArray = Object.keys(cartItems)
        .filter(key => isValidObjectId(key)) // Only include valid ObjectIds
        .map((key) => ({ 
          product: String(key), 
          quantity: Number(cartItems[key]) 
        }));
      cartItemsArray = cartItemsArray.filter(item => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        return toast.error('Cart is empty');
      }

      setIsProcessing(true);
      const token = await getToken();
      const totalAmount = getCartAmount() + Math.floor(getCartAmount() * 0.02);

      // Create Razorpay order
      const { data: orderData } = await axios.post('/api/payment/create-order', 
        { amount: totalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!orderData.success) {
        setIsProcessing(false);
        return toast.error(orderData.message);
      }

      // Capture items array for closure
      const itemsToOrder = [...cartItemsArray];
      const addressId = selectedAddress._id;

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Grainlly',
        description: 'Order Payment',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Get fresh token for verification
            const freshToken = await getToken();
            
            // Verify payment
            const { data: verifyData } = await axios.post('/api/payment/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${freshToken}` } }
            );

            if (verifyData.success) {
              // Create order in database
              const { data } = await axios.post('/api/order/create', {
                address: addressId,
                items: itemsToOrder,
                paymentMethod: 'Online',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              }, {
                headers: { Authorization: `Bearer ${freshToken}` }
              });

              if (data.success) {
                toast.success('Payment successful! Order placed.');
                setCartItems({});
                router.push('/my-orders');
              } else {
                toast.error(data.message);
              }
            } else {
              console.error('Payment verification failed:', verifyData);
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            toast.error(error.response?.data?.message || 'Error processing payment');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.fullName || user.firstName || 'Customer',
          email: user.primaryEmailAddress?.emailAddress || '',
        },
        theme: {
          color: '#667eea',
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setIsProcessing(false);
      toast.error(error.message);
    }
  };

  const handleCODPayment = async () => {
    try {
      if (!user) {
        return toast('Please login to place order', { icon: '⚠️' });
      }

      if (!selectedAddress) {
        return toast.error('Please select an address');
      }

      let cartItemsArray = Object.keys(cartItems)
        .filter(key => isValidObjectId(key)) // Only include valid ObjectIds
        .map((key) => ({ 
          product: String(key), 
          quantity: Number(cartItems[key]) 
        }));
      cartItemsArray = cartItemsArray.filter(item => item.quantity > 0);

      setCartItems(cartItemsArray);

      if (cartItemsArray.length === 0) {
        return toast.error('Cart is empty');
      }

      setIsProcessing(true);
      const token = await getToken();

      const { data } = await axios.post('/api/order/create', {
        address: selectedAddress._id,
        items: cartItemsArray,
        paymentMethod: 'COD',
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        toast.success(data.message);
        setCartItems({});
        router.push('/my-orders');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address) => (
                  <li key={address._id} className="px-4 py-2">
                    {editingAddressId === address._id ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input className="border p-2 text-sm" value={editForm.fullName} onChange={(e) => handleEditChange('fullName', e.target.value)} placeholder="Full Name" />
                          <input className="border p-2 text-sm" value={editForm.phoneNumber} onChange={(e) => handleEditChange('phoneNumber', e.target.value)} placeholder="Phone Number" />
                          <input className="border p-2 text-sm" value={editForm.pincode} onChange={(e) => handleEditChange('pincode', e.target.value)} placeholder="Pincode" />
                          <input className="border p-2 text-sm" value={editForm.area} onChange={(e) => handleEditChange('area', e.target.value)} placeholder="Area" />
                          <input className="border p-2 text-sm" value={editForm.city} onChange={(e) => handleEditChange('city', e.target.value)} placeholder="City" />
                          <select 
                            className="border p-2 text-sm bg-white" 
                            value={editForm.state} 
                            onChange={(e) => handleEditChange('state', e.target.value)}
                          >
                            <option value="">Select State</option>
                            {indianStates.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={saveEdit} className="px-3 py-1 bg-lime-700 text-white text-xs">Save</button>
                          <button onClick={cancelEdit} className="px-3 py-1 border text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <button
                          className="text-left flex-1 hover:bg-gray-500/10 cursor-pointer px-2 py-1"
                          onClick={() => handleAddressSelect(address)}
                        >
                          {address.fullName}, {address.area}, {address.city}, {address.state}
                        </button>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); startEdit(address); }} className="text-xs px-2 py-1 border">Edit</button>
                          <button onClick={(e) => { e.stopPropagation(); deleteAddress(address._id); }} className="text-xs px-2 py-1 border text-red-600">Delete</button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Uncomment promo code section if needed
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
            />
            <button className="bg-lime-700 text-white px-9 py-2 hover:bg-orange-700">
              Apply
            </button>
          </div>
        </div>
        */}

        <hr className="border-gray-500/30 my-5" />

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-3">
            How would you like to pay?
          </label>
          <div className="space-y-3">
            <div 
              onClick={() => setPaymentMethod('Online')}
              className={`border-2 p-4 rounded-lg cursor-pointer transition ${
                paymentMethod === 'Online' 
                  ? 'border-lime-700 bg-lime-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <input 
                  type="radio" 
                  checked={paymentMethod === 'Online'}
                  onChange={() => setPaymentMethod('Online')}
                  className="mt-1 accent-lime-700"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">Pay Online</h3>
                  <p className="text-sm text-gray-600">Pay securely using UPI, Debit/Credit Card, Netbanking, or Wallets via Razorpay.</p>
                  <p className="text-xs text-lime-700 mt-1">✓ Instant confirmation and faster order processing</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setPaymentMethod('COD')}
              className={`border-2 p-4 rounded-lg cursor-pointer transition ${
                paymentMethod === 'COD' 
                  ? 'border-lime-700 bg-lime-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <input 
                  type="radio" 
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 accent-lime-700"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">Cash On Delivery (COD)</h3>
                  <p className="text-sm text-gray-600">Pay when your order is delivered to your doorstep.</p>
                  <p className="text-xs text-amber-600 mt-1">Note: Please ensure the exact amount is ready at the time of delivery</p>
                </div>
              </div>
            </div>
          </div>
          
   
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">{currency}{getCartAmount()}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>
          {/* <div className="flex justify-between">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">{currency}{Math.floor(getCartAmount() * 0.02)}</p>
          </div> */}
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            {/* <p>{currency}{getCartAmount() + Math.floor(getCartAmount() * 0.02)}</p> */}
            <p>{currency}{getCartAmount()}</p>

          </div>
        </div>
      </div>

      <button 
        onClick={handlePayment} 
        disabled={isProcessing || getCartCount() === 0}
        className="w-full bg-lime-700 text-white py-3 mt-5 hover:bg-lime-700/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : paymentMethod === 'Online' ? 'Proceed to Payment' : 'Place Order (COD)'}
      </button>
      
      {paymentMethod === 'Online' && (
        <p className="text-xs text-center text-gray-500 mt-2">
          You will be redirected to Razorpay for secure payment
        </p>
      )}
    </div>
    </>
  )
};

export default OrderSummary;
