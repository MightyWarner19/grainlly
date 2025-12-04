'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';

const AddressDialog = ({ isOpen, onClose, address = null, onSuccess }) => {
    const { getToken, user } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        pincode: "",
        area: "",
        city: "",
        state: ""
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

    // Populate form when editing existing address
    useEffect(() => {
        if (address) {
            setFormData({
                fullName: address.fullName || "",
                phoneNumber: address.phoneNumber || "",
                pincode: address.pincode?.toString() || "",
                area: address.area || "",
                city: address.city || "",
                state: address.state || ""
            });
        } else {
            setFormData({
                fullName: "",
                phoneNumber: "",
                pincode: "",
                area: "",
                city: "",
                state: ""
            });
        }
    }, [address, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            return toast('Please login to manage address', {
                icon: '⚠️',
            });
        }

        // Validation
        if (!formData.fullName || !formData.phoneNumber || !formData.pincode || !formData.area || !formData.city || !formData.state) {
            return toast.error('Please fill all fields');
        }

        if (formData.phoneNumber.length !== 10) {
            return toast.error('Phone number must be 10 digits');
        }

        if (formData.pincode.length !== 6) {
            return toast.error('Pincode must be 6 digits');
        }

        try {
            setIsSubmitting(true);
            const token = await getToken();
            
            const addressData = {
                address: {
                    fullName: formData.fullName,
                    phoneNumber: formData.phoneNumber,
                    pincode: Number(formData.pincode),
                    area: formData.area,
                    city: formData.city,
                    state: formData.state
                }
            };

            let response;
            if (address) {
                // Update existing address
                response = await axios.put(`/api/user/update-address`, {
                    ...addressData,
                    addressId: address._id
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Add new address
                response = await axios.post('/api/user/add-address', addressData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            if (response.data.success) {
                toast.success(response.data.message);
                onSuccess?.();
                onClose();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Address operation error:', error);
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {address ? 'Update Address' : 'Add New Address'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                maxLength="10"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition"
                                placeholder="10 digit mobile number"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                                    Pincode *
                                </label>
                                <input
                                    type="text"
                                    id="pincode"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    maxLength="6"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition"
                                    placeholder="6 digit pincode"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition"
                                    placeholder="Enter city"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                                Area / Street / Locality *
                            </label>
                            <textarea
                                id="area"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition resize-none"
                                placeholder="House no., Building name, Street, Area"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                State *
                            </label>
                            <select
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition bg-white"
                                required
                            >
                                <option value="">Select State</option>
                                {indianStates.map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 bg-lime-600 text-white font-medium rounded-lg hover:bg-lime-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : (address ? 'Update Address' : 'Save Address')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddressDialog;
