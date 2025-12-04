'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import { assets } from '@/assets/assets';
import RichTextEditor from '@/components/RichTextEditor';


const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageRemoved, setImageRemoved] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'Draft',
    author: 'Team Grainlly'
  });

  // Fetch blog posts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/seller/blog');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from title (only for new posts or if slug is empty)
    if (name === 'title' && (!editingPost || !formData.slug)) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageRemoved(false); // Reset removal flag when new image is selected
    }
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingPost 
        ? `/api/seller/blog/${editingPost._id}`
        : '/api/seller/blog';
      
      const method = editingPost ? 'PUT' : 'POST';
      
      console.log('Submitting blog post:', { method, url, editingPost: !!editingPost });

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('slug', formData.slug);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('content', formData.content);
      submitData.append('status', formData.status);
      submitData.append('author', formData.author);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }
      
      // Handle image removal or existing image
      if (editingPost) {
        if (imageRemoved) {
          // Image was explicitly removed
          submitData.append('removeImage', 'true');
        } else if (!imageFile && editingPost.image) {
          // Keep existing image if no new image and not removed
          submitData.append('existingImage', editingPost.image);
        }
      }

      const response = await fetch(url, {
        method,
        body: submitData,
      });

      const data = await response.json();
      
      console.log('API Response:', { status: response.status, data });

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error || 'Failed to save blog post');
      }

      toast.success(editingPost ? 'Post updated successfully!' : 'Post created successfully!');
      
      // Reset form and refresh posts
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        status: 'Draft',
        author: 'Team Grainlly'
      });
      setImageFile(null);
      setImagePreview('');
      setImageRemoved(false);
      setEditingPost(null);
      setShowForm(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(error.message || 'Failed to save blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit button click
  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      status: post.status || 'Draft',
      author: post.author || 'Team Grainlly'
    });
    setImageFile(null);
    setImagePreview(post.image || '');
    setImageRemoved(false);
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/seller/blog/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      toast.success('Post deleted successfully!');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete blog post');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-32"></div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden h-64">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Blog</h2>
            
          </div>
          <button
            onClick={() => {
              setEditingPost(null);
              setFormData({ 
                title: '', 
                slug: '',
                excerpt: '', 
                content: '', 
                status: 'Draft',
                author: 'Team Grainlly'
              });
              setImageFile(null);
              setImagePreview('');
              setImageRemoved(false);
              setShowForm(!showForm);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              showForm 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-lime-700 text-white hover:bg-lime-800 shadow-sm hover:shadow-md'
            }`}
          >
            {showForm ? (
              <>
                <FaArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to List</span>
                <span className="sm:hidden">Back</span>
              </>
            ) : (
              <>
                <FaPlus className="w-4 h-4" />
                <span>New Post</span>
              </>
            )}
          </button>
        </div>

        {showForm ? (
          /* Blog Post Form */
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                {editingPost ? 'Edit Blog Post' : 'Create New Post'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                    placeholder="Enter blog post title"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                    placeholder="url-friendly-slug"
                  />
                  <p className="mt-1 text-xs text-gray-500">Auto-generated from title, but you can edit it</p>
                </div>

                {/* Excerpt */}
                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Excerpt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    required
                    rows="2"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors resize-none"
                    placeholder="Brief description of the post"
                  />
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    key={editingPost?._id || 'new'}
                    initialHTML={formData.content}
                    onChange={(val) => {
                      console.log('Content updated:', val?.length || 0, 'characters');
                      setFormData(prev => ({ ...prev, content: val }));
                    }}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Use the rich text editor to format your blog post. Supports headings, lists, bold, italic, and more.
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Blog Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <label htmlFor="blog-image" className="cursor-pointer flex-shrink-0">
                      <input
                        type="file"
                        id="blog-image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-gray-300 rounded-lg hover:border-lime-500 transition-colors overflow-hidden">
                        <Image
                          src={imagePreview || assets.upload_area}
                          alt="Upload preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </label>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
                        {imageFile ? imageFile.name : editingPost?.image ? 'Current image loaded' : 'Click to upload blog image'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Recommended: 800x600px or larger
                      </p>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview('');
                            setImageRemoved(true); // Mark image as removed
                          }}
                          className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Author Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>

                  {/* Author */}
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Author
                    </label>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
                      placeholder="Team Grainlly"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPost(null);
                      setFormData({
                        title: '',
                        slug: '',
                        excerpt: '',
                        content: '',
                        status: 'Draft',
                        author: 'Team Grainlly'
                      });
                      setImageFile(null);
                      setImagePreview('');
                      setImageRemoved(false);
                    }}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 text-sm bg-lime-700 text-white font-medium rounded-lg hover:bg-lime-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{editingPost ? 'Updating...' : 'Publishing...'}</span>
                      </>
                    ) : (
                      <span>{editingPost ? 'Update Post' : 'Publish Post'}</span>
                    )}
                  </button>
                </div>
                </form>
              </div>
            </div>
        ) : (
          /* Blog Posts List */
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
            {posts.length === 0 ? (
              <div className="text-center p-8 sm:p-12">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mb-3 sm:mb-4 flex items-center justify-center">
                  <FaFileAlt className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
                <p className="text-sm text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                  Get started by creating your first blog post to engage with your audience.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-lime-700 text-white text-sm font-medium rounded-lg hover:bg-lime-800 transition-colors"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Create First Post</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4 sm:p-6">
                {posts.map((post) => (
                  <div key={post._id} className="group bg-white rounded-lg border border-gray-200 hover:border-lime-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                    {post.image && (
                      <div className="h-40 sm:h-48 relative overflow-hidden bg-gray-100">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4 sm:p-5">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 flex-1">
                          {post.title}
                        </h3>
                        <div className="flex gap-1 sm:gap-2  transition-opacity flex-shrink-0">
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-1.5 text-gray-500 hover:text-lime-700 hover:bg-lime-50 rounded-full transition-colors"
                            title="Edit post"
                          >
                            <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete post"
                          >
                            <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                        <span className="truncate">
                          {new Date(post.createdAt || new Date()).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="text-xs px-2 py-1 bg-lime-50 text-lime-700 rounded-full whitespace-nowrap ml-2">
                          {post.status || 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;