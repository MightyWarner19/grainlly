'use client'
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTimes, FaStar } from 'react-icons/fa';

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    rating: 5,
    comment: '',
    isActive: true,
    order: 0,
    avatarUrl: ''
  });

  const fetchTestimonials = async () => {
    try {
      const { data } = await axios.get('/api/testimonial/list');

      if (data.success) {
        setTestimonials(data.testimonials);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to load testimonials');
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name || '',
      role: testimonial.role || '',
      rating: testimonial.rating || 5,
      comment: testimonial.comment || '',
      isActive: testimonial.isActive !== undefined ? testimonial.isActive : true,
      order: testimonial.order || 0,
      avatarUrl: testimonial.avatar || ''
    });
    setAvatarPreview(testimonial.avatar || '');
    setAvatarFile(null);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingTestimonial(null);
    setFormData({
      name: '',
      role: '',
      rating: 5,
      comment: '',
      isActive: true,
      order: 0,
      avatarUrl: ''
    });
    setAvatarPreview('');
    setAvatarFile(null);
    setShowModal(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.comment) {
      toast.error('Name and comment are required');
      return;
    }

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('role', formData.role);
    submitData.append('rating', formData.rating);
    submitData.append('comment', formData.comment);
    submitData.append('isActive', formData.isActive);
    submitData.append('order', formData.order);
    submitData.append('avatarUrl', formData.avatarUrl);

    if (avatarFile) {
      submitData.append('avatar', avatarFile);
    }

    try {
      setLoading(true);
      let response;

      if (editingTestimonial) {
        response = await axios.put(`/api/testimonial/${editingTestimonial._id}`, submitData);
      } else {
        response = await axios.post('/api/testimonial/add', submitData);
      }

      if (response.data.success) {
        toast.success(editingTestimonial ? 'Testimonial updated successfully' : 'Testimonial added successfully');
        setShowModal(false);
        fetchTestimonials();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to save testimonial');
      console.error('Error saving testimonial:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.delete(`/api/testimonial/${id}`);

      if (data.success) {
        toast.success('Testimonial deleted successfully');
        fetchTestimonials();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to delete testimonial');
      console.error('Error deleting testimonial:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (testimonial) => {
    const submitData = new FormData();
    submitData.append('name', testimonial.name);
    submitData.append('role', testimonial.role);
    submitData.append('rating', testimonial.rating);
    submitData.append('comment', testimonial.comment);
    submitData.append('isActive', !testimonial.isActive);
    submitData.append('order', testimonial.order);
    submitData.append('avatarUrl', testimonial.avatar);

    try {
      const { data } = await axios.put(`/api/testimonial/${testimonial._id}`, submitData);

      if (data.success) {
        toast.success('Status updated successfully');
        fetchTestimonials();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
      {loading ? (
        <Loading />
      ) : (
        <div className="md:p-10 p-4 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Testimonials</h2>
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-[#8BA469] hover:bg-[#7a945a] text-white font-semibold rounded-lg transition-colors"
            >
              Add New Testimonial
            </button>
          </div>

          {/* Testimonials List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial._id}
                className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                  testimonial.isActive ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {testimonial.avatar ? (
                      <Image
                        src={testimonial.avatar}
                        width={50}
                        height={50}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#8BA469] text-white flex items-center justify-center text-lg font-semibold">
                        {testimonial.name?.charAt(0) || 'T'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">{testimonial.name}</h3>
                      {testimonial.role && (
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActive(testimonial)}
                    className="text-2xl cursor-pointer"
                  >
                    {testimonial.isActive ? (
                      <FaToggleOn className="text-green-500" />
                    ) : (
                      <FaToggleOff className="text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < testimonial.rating ? 'text-yellow-500' : 'text-gray-300'}
                      size={16}
                    />
                  ))}
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">"{testimonial.comment}"</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">Order: {testimonial.order}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="p-2 text-gray-500 hover:text-lime-700 hover:bg-lime-50 rounded-lg transition-colors"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {testimonials.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No testimonials found. Add your first testimonial!</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl  w-[90vw] lg:w-[40vw] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar
                </label>
                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      width={80}
                      height={80}
                      alt="Avatar preview"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#8BA469] file:text-white hover:file:bg-[#7a945a]"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA469] focus:border-transparent"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role/Location
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA469] focus:border-transparent"
                  placeholder="e.g., Delhi, Customer, etc."
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <FaStar
                        size={32}
                        className={star <= formData.rating ? 'text-yellow-500' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment *
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA469] focus:border-transparent"
                  required
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA469] focus:border-transparent"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-[#8BA469] rounded focus:ring-[#8BA469]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (Show on website)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[#8BA469] hover:bg-[#7a945a] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManagement;
