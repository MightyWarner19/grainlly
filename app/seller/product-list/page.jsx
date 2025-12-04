'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTimes, FaExternalLinkAlt, FaStar } from 'react-icons/fa';
import { GrView } from 'react-icons/gr';

import { useRouter } from 'next/navigation';
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [benefitIconFiles, setBenefitIconFiles] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    price: '',
    offerPrice: '',
    category: '',
    brand: 'Generic',
    rating: 0,
    color: '',
    weight: '',
    unit: 'kg',
    stock: '',
    sku: '',
    benefits: [],
    faqs: []
  });

  const { currency, getToken } = useAppContext();
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/product/seller-list');

      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to load products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  console.log("products",products)

  const handleEdit = (product) => {
    console.log('Editing product:', product); // Debug log
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      price: product.price || '',
      offerPrice: product.offerPrice || '',
      category: product.category || '',
      brand: product.brand || 'Generic',
      rating: product.rating || 0,
      color: product.color || '',
      weight: product.weight || '',
      unit: product.unit || 'kg',
      stock: product.stock || 0,
      sku: product.sku || '',
      benefits: product.benefits || [],
      faqs: product.faqs || []
    });
    setImagePreviews(product.image || []);
    setImageFiles([]);
    setShowEditModal(true);
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setImageFiles(prev => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Benefits management functions
  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, { title: '', description: '', icon: '' }]
    }));
  };

  const removeBenefit = (index) => {
    // Clean up file reference if exists
    setBenefitIconFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
    
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const updateBenefit = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => 
        i === index ? { ...benefit, [field]: value } : benefit
      )
    }));
  };

  const handleBenefitIconUpload = (index, file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setBenefitIconFiles(prev => ({ ...prev, [index]: file }));
      updateBenefit(index, 'icon', previewUrl);
    }
  };

  // FAQs management functions
  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const removeFaq = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const updateFaq = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => 
        i === index ? { ...faq, [field]: value } : faq
      )
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    console.log('Updating with formData:', formData); // Debug log
    
    setIsUpdating(true);
    try {
      let response;
      
      // Always use FormData to handle both cases (with or without new images)
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('shortDescription', formData.shortDescription || '');
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('offerPrice', formData.offerPrice);
      submitData.append('category', formData.category);
      submitData.append('brand', formData.brand || 'Generic');
      submitData.append('rating', formData.rating || 0);
      submitData.append('color', formData.color || '');
      submitData.append('weight', formData.weight || '');
      submitData.append('unit', formData.unit || 'kg');
      submitData.append('stock', formData.stock || 0);
      submitData.append('sku', formData.sku || '');
      // Handle benefit icons - upload new files and keep existing URLs
      const benefitsWithIcons = await Promise.all(
        (formData.benefits || []).map(async (benefit, index) => {
          if (benefitIconFiles[index]) {
            // New file uploaded for this benefit
            submitData.append(`benefitIcon_${index}`, benefitIconFiles[index]);
            return { ...benefit, iconIndex: index };
          } else {
            // Keep existing icon URL
            return benefit;
          }
        })
      );
      
      submitData.append('benefits', JSON.stringify(benefitsWithIcons));
      submitData.append('faqs', JSON.stringify(formData.faqs || []));
      
      // Add existing images to FormData if no new images are uploaded
      if (imageFiles.length === 0 && editingProduct?.image?.length > 0) {
        // If no new images but existing images exist, include them
        editingProduct.image.forEach((img, index) => {
          // Add existing image URLs as strings
          submitData.append('existingImages', img);
        });
      } else if (imageFiles.length > 0) {
        // Add new images
        imageFiles.forEach(file => {
          submitData.append('images', file);
        });
      }
      
      console.log('Sending FormData with', imageFiles.length > 0 ? 'new images' : 'existing images');
      console.log('Benefits data being sent:', JSON.stringify(benefitsWithIcons, null, 2));
      console.log('FAQs data being sent:', JSON.stringify(formData.faqs, null, 2));
      
      // Get auth token
      const token = await getToken();
      
      console.log('Updating product ID:', editingProduct._id);
      console.log('Auth token present:', !!token);
      
      response = await axios.put(`/api/product/${editingProduct._id}`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Update response:', response.data);
      
      if (response.data.success) {
        toast.success('Product updated successfully!');
        setShowEditModal(false);
        setEditingProduct(null);
        setImageFiles([]);
        setImagePreviews([]);
        setBenefitIconFiles({});
        await fetchProducts();
      } else {
        toast.error(response.data.message || 'Update failed');
        console.error('Update failed:', response.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update product';
      toast.error(errorMessage);
      console.error('Error updating product:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { data } = await axios.delete(`/api/product/${id}`);
      if (data.success) {
        toast.success('Product deleted successfully!');
        fetchProducts();
      }
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  const toggleActive = async (product) => {
    try {
      // If isActive is undefined, treat it as true (active by default)
      const currentStatus = product.isActive !== false;
      const newStatus = !currentStatus;
      
      // Optimistic UI update - update immediately
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p._id === product._id 
            ? { ...p, isActive: newStatus }
            : p
        )
      );
      
      const { data } = await axios.put(`/api/product/${product._id}`, {
        isActive: newStatus
      });
      
      if (data.success) {
        toast.success(newStatus ? 'Product marked as in stock' : 'Product marked as out of stock');
      } else {
        // Revert on failure
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p._id === product._id 
              ? { ...p, isActive: currentStatus }
              : p
          )
        );
        toast.error('Failed to update product status');
      }
    } catch (error) {
      // Revert on error
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p._id === product._id 
            ? { ...p, isActive: currentStatus }
            : p
        )
      );
      toast.error('Failed to update product status');
      console.error('Error toggling product status:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  console.log("formData",formData)

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? <Loading /> : <div className="w-full md:p-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="pb-4 text-lg font-medium">All Product</h2>
          <Link href="/seller" className="px-4 py-1.5 bg-[#8BA469] hover:bg-[#7a945a] text-white font-semibold rounded-full transition-all transform hover:scale-105 shadow-lg">
            Add New Product
          </Link>
        </div>
        <div className="flex flex-col items-center max-w-7xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className=" table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="w-1/3 px-4 py-3 font-medium truncate">Product</th>
                <th className="px-4 py-3 font-medium truncate max-sm:hidden">Category</th>
                <th className="px-4 py-3 font-medium truncate">Price</th>
                <th className="px-4 py-3 font-medium truncate">Rating</th>
                <th className="px-4 py-3 font-medium truncate max-sm:hidden">Status</th>
                <th className="px-4 py-3 font-medium truncate text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {products.map((product, index) => (
                <tr key={index} className="border-t border-gray-500/20 hover:bg-gray-50">
                  <td className="md:px-4 pl-2 md:pl-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className=" rounded flex-shrink-0">
                        <Image
                          src={product.image[0]}
                          alt={product.name}
                          className="w-16 h-16 object-cover"
                          width={64}
                          height={64}
                        />
                      </div>
                      <span className="truncate">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">{product.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{currency}{product.offerPrice}</span>
                      <span className="text-xs line-through text-gray-400">{currency}{product.price}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">
                    <div className="flex items-center gap-1">
                      <FaStar className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="font-medium text-gray-900">{product.rating || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">
                    <button
                      onClick={() => toggleActive(product)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        product.isActive !== false
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {product.isActive !== false ? (
                        <>
                          <FaToggleOn className="w-3.5 h-3.5" />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <FaToggleOff className="w-3.5 h-3.5" />
                          <span>Out of Stock</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => window.open(`/product/${product.slug}`, '_blank')}
                        className="p-2 text-gray-600 hover:text-lime-700 hover:bg-lime-50 rounded-lg transition-colors"
                        title="View product"
                      >
                        <GrView className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-gray-600 hover:text-lime-700 hover:bg-lime-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Edit Product</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                  {/* Product Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images
                    </label>
                    <div className="space-y-3">
                      <label htmlFor="edit-product-images" className="cursor-pointer inline-block">
                        <input
                          type="file"
                          id="edit-product-images"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-lime-500 transition-colors">
                          <FaEdit className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Change Images</span>
                        </div>
                      </label>
                      
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <div className="relative w-full aspect-square border border-gray-200 rounded-lg overflow-hidden">
                                <Image
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <FaTimes className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Upload new images to replace existing ones
                      </p>
                    </div>
                  </div>

                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
                      <input
                        type="text"
                        readOnly
                        value={String(formData.name).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 resize-y"
                      placeholder="A concise 1–2 line summary"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Long Description <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      key={editingProduct?._id}
                      initialHTML={formData.description}
                      onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                    />
                  </div>

                  {/* Price and Offer Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Regular Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Offer Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="offerPrice"
                        value={formData.offerPrice}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                      />
                    </div>
                  </div>

                  {/* Category */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    />
                  </div>

                  {/* Additional Details */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Additional Details (Optional)</h4>
                    
                    {/* Brand and Color */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                        <input
                          type="text"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <input
                          type="text"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                      </div>
                    </div>

                    {/* Weight and Unit */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight/Quantity</label>
                        <input
                          type="text"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <select
                          name="unit"
                          value={formData.unit}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="l">l</option>
                          <option value="ml">ml</option>
                          <option value="pcs">pcs</option>
                          <option value="pack">pack</option>
                          <option value="box">box</option>
                        </select>
                      </div>
                    </div>

                    {/* Stock and SKU */}
                    {/* <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        />
                      </div>
                    </div> */}
                  </div>

                  {/* Benefits Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-900">Product Benefits</h4>
                      <button
                        type="button"
                        onClick={addBenefit}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-lime-100 text-lime-700 rounded-lg hover:bg-lime-200 transition-colors"
                      >
                        <FaEdit className="w-3 h-3" />
                        Add Benefit
                      </button>
                    </div>
                    
                    {formData.benefits && formData.benefits.length > 0 && (
                      <div className="space-y-3">
                        {formData.benefits.map((benefit, index) => (
                          <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-medium text-gray-700">Benefit {index + 1}</h5>
                              <button
                                type="button"
                                onClick={() => removeBenefit(index)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              >
                                <FaTimes className="w-3 h-3" />
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Cold-Pressed, Stone-Ground"
                                  value={benefit.title || ''}
                                  onChange={(e) => updateBenefit(index, 'title', e.target.value)}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-lime-500 focus:border-lime-500"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                  rows={2}
                                  placeholder="Brief description of this benefit"
                                  value={benefit.description || ''}
                                  onChange={(e) => updateBenefit(index, 'description', e.target.value)}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-lime-500 focus:border-lime-500 resize-y"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Icon Image <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleBenefitIconUpload(index, e.target.files[0])}
                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-lime-500 focus:border-lime-500"
                                    required={!benefit.icon}
                                  />
                                  {benefit.icon && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                        <Image
                                          src={benefit.icon}
                                          alt="Icon preview"
                                          width={20}
                                          height={20}
                                          className="w-5 h-5 object-contain"
                                        />
                                      </div>
                                      <span className="text-xs text-gray-500">Current icon</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {(!formData.benefits || formData.benefits.length === 0) && (
                      <div className="text-center py-6 text-gray-500">
                        <p className="text-xs">No benefits added yet. Click "Add Benefit" to start.</p>
                      </div>
                    )}
                  </div>

                  {/* FAQs Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-900">Product FAQs</h4>
                      <button
                        type="button"
                        onClick={addFaq}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <FaEdit className="w-3 h-3" />
                        Add FAQ
                      </button>
                    </div>
                    
                    {formData.faqs && formData.faqs.length > 0 && (
                      <div className="space-y-3">
                        {formData.faqs.map((faq, index) => (
                          <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-medium text-gray-700">FAQ {index + 1}</h5>
                              <button
                                type="button"
                                onClick={() => removeFaq(index)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              >
                                <FaTimes className="w-3 h-3" />
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Question <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., How is this different from regular wheat flour?"
                                  value={faq.question || ''}
                                  onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Answer <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                  rows={2}
                                  placeholder="Provide a detailed answer to this question"
                                  value={faq.answer || ''}
                                  onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {(!formData.faqs || formData.faqs.length === 0) && (
                      <div className="text-center py-6 text-gray-500">
                        <p className="text-xs">No FAQs added yet. Click "Add FAQ" to start.</p>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        'Update Product'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>}

    </div>
  );
};

export default ProductList;