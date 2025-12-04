'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';

const FeedbackDialog = ({ isOpen, onClose, product, orderId }) => {
    const { getToken, user } = useAppContext();
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [likedAspects, setLikedAspects] = useState([]);
    const [loading, setLoading] = useState(false);

    // Debug logging
    React.useEffect(() => {
        if (isOpen) {
            console.log('FeedbackDialog opened with:', { product, orderId, isOpen });
        }
    }, [isOpen, product, orderId]);

    const aspects = [
        'Organic Quality',
        'Fresh & Natural',
        'Great Taste',
        'Value For Money',
        'Packaging Quality',
        'Fast Delivery',
        'Health Benefits',
        'Purity & Authenticity'
    ];

    const handleAspectToggle = (aspect) => {
        setLikedAspects(prev => 
            prev.includes(aspect) 
                ? prev.filter(a => a !== aspect)
                : [...prev, aspect]
        );
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (likedAspects.length === 0) {
            toast.error('Please select at least one aspect you liked');
            return;
        }

        try {
            setLoading(true);
            const token = await getToken();

            const reviewData = {
                productId: product._id,
                orderId: orderId,
                rating,
                reviewText,
                likedAspects,
                userName: user?.firstName + ' ' + user?.lastName || 'Anonymous',
                userEmail: user?.emailAddresses?.[0]?.emailAddress || ''
            };

            const response = await axios.post('/api/review', reviewData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Thank you for your feedback!');
                onClose();
                // Reset form
                setRating(0);
                setReviewText('');
                setLikedAspects([]);
            } else {
                toast.error(response.data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Review submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Share Your Review</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Product Info */}
                    <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product?.image?.[0] ? (
                                <Image
                                    src={product.image[0]}
                                    alt={product.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                                {product?.name || 'Grainlly Organic Product'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Premium Organic Quality
                            </p>
                        </div>
                    </div>

                    {/* Rating */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                            How was the product?
                        </h4>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`w-12 h-12 rounded-lg transition-colors ${
                                        star <= rating 
                                            ? 'bg-yellow-400 text-white' 
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Liked Aspects */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                            What did you like about the product? <span className="text-red-500">*</span>
                        </h4>
                        <div className="space-y-3">
                            {aspects.map((aspect) => (
                                <label
                                    key={aspect}
                                    className="flex items-center gap-3 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={likedAspects.includes(aspect)}
                                        onChange={() => handleAspectToggle(aspect)}
                                        className="w-5 h-5 text-lime-600 border-2 border-gray-300 rounded focus:ring-lime-500"
                                    />
                                    <span className="text-gray-700">{aspect}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Review Text */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                            Additional Comments (Optional)
                        </h4>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your experience with this organic product..."
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                            rows={4}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || rating === 0 || likedAspects.length === 0}
                        className="w-full py-3 px-4 bg-lime-600 text-white font-semibold rounded-lg hover:bg-lime-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackDialog;
