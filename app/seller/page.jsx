'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import RichTextEditor from "@/components/RichTextEditor";

const AddProduct = () => {
  
  const router = useRouter()

  const { getToken } = useAppContext()
  const [categoriesList, setCategoriesList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [files, setFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [rating, setRating] = useState('5.0');
  const [brand, setBrand] = useState('Grainlly');
  const [color, setColor] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('kg');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [benefits, setBenefits] = useState([]);
  const [benefitIconFiles, setBenefitIconFiles] = useState({});
  const [faqs, setFaqs] = useState([]);

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Benefits management functions
  const addBenefit = () => {
    setBenefits(prev => [...prev, { title: '', description: '', icon: '' }]);
  };

  const removeBenefit = (index) => {
    // Clean up file reference if exists
    setBenefitIconFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
    
    setBenefits(prev => prev.filter((_, i) => i !== index));
  };

  const updateBenefit = (index, field, value) => {
    setBenefits(prev => prev.map((benefit, i) => 
      i === index ? { ...benefit, [field]: value } : benefit
    ));
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
    setFaqs(prev => [...prev, { question: '', answer: '' }]);
  };

  const removeFaq = (index) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
  };

  const updateFaq = (index, field, value) => {
    setFaqs(prev => prev.map((faq, i) => 
      i === index ? { ...faq, [field]: value } : faq
    ));
  };

  useEffect(() => {
    const makeSlug = (str) => String(str).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    setSlug(name ? makeSlug(name) : '');
  }, [name]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error('Please add at least one product image');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData()

    formData.append('name', name)
    formData.append('shortDescription', shortDescription)
    formData.append('description', description)
    formData.append('category', category)
    formData.append('price', price)
    formData.append('offerPrice', offerPrice)
    formData.append('rating', rating || 0)
    formData.append('brand', brand)
    formData.append('color', color)
    formData.append('weight', weight)
    formData.append('unit', unit)
    formData.append('stock', stock || 0)
    formData.append('sku', sku)
    // Handle benefit icons
    const benefitsWithIcons = benefits.map((benefit, index) => {
      if (benefitIconFiles[index]) {
        formData.append(`benefitIcon_${index}`, benefitIconFiles[index]);
        return { ...benefit, iconIndex: index };
      }
      return benefit;
    });
    
    formData.append('benefits', JSON.stringify(benefitsWithIcons))
    formData.append('faqs', JSON.stringify(faqs))

    console.log('Sending rating:', rating, 'Type:', typeof rating);
    console.log('Sending FAQs:', JSON.stringify(faqs, null, 2));
    console.log('FAQs count:', faqs.length);

    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i])
    }

    try {

      const token = await getToken()

      const { data } = await axios.post('/api/product/add', formData, { headers: { Authorization: `Bearer ${token}` } })

      if (data.success) {
        toast.success(data.message)
        setFiles([]);
        setImagePreviews([]);
        setName('');
        setDescription('');
        setCategory(categoriesList[0]?.name || '');
        setPrice('');
        setOfferPrice('');
        setRating('4.0');
        setBrand('Grainlly');
        setColor('');
        setWeight('');
        setUnit('kg');
        setStock('');
        setSku('');
        setBenefits([]);
        setBenefitIconFiles({});
        setFaqs([]);
        router.push('/seller/product-list')
      } else {
        toast.error(data.message);
      }


    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false);
    }


  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get('/api/category', { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) {
          const list = Array.isArray(data.data) ? data.data : [];
          setCategoriesList(list);
          if (!category && list.length) {
            setCategory(list[0].name);
          }
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl">
        <div className="mb-2">
          <h2 className="pb-2 text-lg font-medium">Add Product</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="space-y-5">
            {/* Product Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <label htmlFor="product-images" className="cursor-pointer inline-block">
                  <input
                    type="file"
                    id="product-images"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-lime-500 transition-colors">
                    <FaPlus className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Add Images</span>
                  </div>


                </label>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
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
                  Upload up to 4 images. First image will be the main product image.
                </p>
              </div>
            </div>
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="product-name">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                placeholder="Enter product name"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="product-slug">
                Slug
              </label>
              <input
                id="product-slug"
                type="text"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                value={slug}
                readOnly
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="product-short-description">
                Short Description
              </label>
              <textarea
                id="product-short-description"
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors resize-y"
                placeholder="A concise 1-2 line summary shown on cards/search"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>

            {/* Long Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="product-description">
                Long Description <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                key={description}
                initialHTML={description}
                onChange={setDescription}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="category">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
                required
              >
                <option value="">Select a category</option>
                {categoriesList.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="rating">
                Rating <span className="text-red-500">*</span>
              </label>
              <input
                id="rating"
                type="number"
                placeholder="0.0"
                min="0"
                max="5"
                step="0.1"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                onChange={(e) => setRating(e.target.value)}
                value={rating}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter a rating between 0 and 5 (e.g., 4.5)</p>
            </div>

            {/* Price and Offer Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="product-price">
                  Regular Price <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-price"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                  onChange={(e) => setPrice(e.target.value)}
                  value={price}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="offer-price">
                  Offer Price <span className="text-red-500">*</span>
                </label>
                <input
                  id="offer-price"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                  onChange={(e) => setOfferPrice(e.target.value)}
                  value={offerPrice}
                  required
                />
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Additional Details</h3>

              <div className="space-y-4">
                {/* Brand and Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="brand">
                      Brand
                    </label>
                    <input
                      id="brand"
                      type="text"
                      placeholder="e.g., Generic, Basmati King"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                      onChange={(e) => setBrand(e.target.value)}
                      value={brand}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="color">
                      Color
                    </label>
                    <input
                      id="color"
                      type="text"
                      placeholder="e.g., White, Multi, Brown"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                      onChange={(e) => setColor(e.target.value)}
                      value={color}
                    />
                  </div>
                </div>

                {/* Weight and Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="weight">
                      Weight/Quantity
                    </label>
                    <input
                      id="weight"
                      type="text"
                      placeholder="e.g., 1, 5, 10"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                      onChange={(e) => setWeight(e.target.value)}
                      value={weight}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="unit">
                      Unit
                    </label>
                    <select
                      id="unit"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                      onChange={(e) => setUnit(e.target.value)}
                      value={unit}
                    >
                      <option value="kg">kg (Kilogram)</option>
                      <option value="g">g (Gram)</option>
                      <option value="l">l (Liter)</option>
                      <option value="ml">ml (Milliliter)</option>
                      <option value="pcs">pcs (Pieces)</option>
                      <option value="pack">pack (Pack)</option>
                      <option value="box">box (Box)</option>
                    </select>
                  </div>
                </div>

                {/* Stock and SKU */}
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="stock">
                      Stock Quantity
                    </label>
                    <input
                      id="stock"
                      type="number"
                      placeholder="0"
                      min="0"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                      onChange={(e) => setStock(e.target.value)}
                      value={stock}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="sku">
                      SKU (Stock Keeping Unit)
                    </label>
                    <input
                      id="sku"
                      type="text"
                      placeholder="e.g., RICE-BAS-001"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                      onChange={(e) => setSku(e.target.value)}
                      value={sku}
                    />
                  </div>
                </div> */}
              </div>
            </div>

            {/* Benefits Section */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Product Benefits</h3>
                <button
                  type="button"
                  onClick={addBenefit}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-lime-100 text-lime-700 rounded-lg hover:bg-lime-200 transition-colors"
                >
                  <FaPlus className="w-3 h-3" />
                  Add Benefit
                </button>
              </div>
              
              {benefits.length > 0 && (
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Benefit {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Cold-Pressed, Stone-Ground"
                            value={benefit.title}
                            onChange={(e) => updateBenefit(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
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
                            value={benefit.description}
                            onChange={(e) => updateBenefit(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 resize-y"
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
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                              required={!benefit.icon}
                            />
                            {benefit.icon && (
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                  <Image
                                    src={benefit.icon}
                                    alt="Icon preview"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 object-contain"
                                  />
                                </div>
                                <span className="text-xs text-gray-500">Icon preview</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Upload an icon image for this benefit (PNG, JPG, SVG recommended)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {benefits.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No benefits added yet. Click "Add Benefit" to start.</p>
                </div>
              )}
            </div>

            {/* FAQs Section */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Product FAQs</h3>
                <button
                  type="button"
                  onClick={addFaq}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <FaPlus className="w-3 h-3" />
                  Add FAQ
                </button>
              </div>
              
              {faqs.length > 0 && (
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">FAQ {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeFaq(index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Question <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., How is this different from regular wheat flour?"
                            value={faq.question}
                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Answer <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Provide a detailed answer to this question"
                            value={faq.answer}
                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {faqs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No FAQs added yet. Click "Add FAQ" to start.</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting || files.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 bg-lime-700 text-white text-sm font-medium rounded-lg hover:bg-lime-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Adding Product...</span>
                  </>
                ) : (
                  <span>Add Product</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;