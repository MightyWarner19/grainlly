'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';
import Pagination from '@/components/Pagination';
import { FaTrash, FaToggleOn, FaToggleOff, FaEnvelope, FaDownload } from 'react-icons/fa';

const NewsletterManagement = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalSubscribers: 0,
    subscribersPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchSubscribers = async (page = 1, status = 'all') => {
    try {
      setLoading(true);
      const statusParam = status === 'all' ? '' : `&status=${status}`;
      const { data } = await axios.get(
        `/api/newsletter/admin?page=${page}&limit=20${statusParam}`
      );

      if (data.success) {
        setSubscribers(data.subscribers);
        setPagination(data.pagination);
        setCurrentPage(page);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to load subscribers');
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers(1, statusFilter);
  }, [statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      const { data } = await axios.delete(`/api/newsletter/admin?id=${id}`);

      if (data.success) {
        toast.success(data.message);
        fetchSubscribers(currentPage, statusFilter);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to delete subscriber');
      console.error('Error deleting subscriber:', error);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const { data } = await axios.put('/api/newsletter/admin', {
        id,
        isActive: !currentStatus
      });

      if (data.success) {
        toast.success(data.message);
        fetchSubscribers(currentPage, statusFilter);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Email', 'Subscribed At', 'Status'],
      ...subscribers.map(sub => [
        sub.email,
        new Date(sub.subscribedAt).toLocaleDateString(),
        sub.isActive ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Subscribers exported successfully!');
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-medium">Newsletter Subscribers</h2>
             
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-lime-700 text-white text-sm font-medium rounded-lg hover:bg-lime-800 transition-colors"
            >
              <FaDownload className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-lime-100 rounded-lg">
                  <FaEnvelope className="w-5 h-5 text-lime-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Subscribers</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {pagination.totalSubscribers}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaToggleOn className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {subscribers.filter(s => s.isActive).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <FaToggleOff className="w-5 h-5 text-red-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Inactive</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {subscribers.filter(s => !s.isActive).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-lime-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-lime-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === 'inactive'
                    ? 'bg-lime-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex flex-col items-center max-w-7xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed w-full overflow-hidden">
              <thead className="text-gray-900 text-sm text-left bg-gray-50">
                <tr>
                  <th className="w-1/2 px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium max-sm:hidden">Subscribed At</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No subscribers found
                    </td>
                  </tr>
                ) : (
                  subscribers.map((subscriber) => (
                    <tr key={subscriber._id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-sm:hidden text-gray-600">
                        {new Date(subscriber.subscribedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(subscriber._id, subscriber.isActive)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            subscriber.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {subscriber.isActive ? (
                            <>
                              <FaToggleOn className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <FaToggleOff className="w-3.5 h-3.5" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(subscriber._id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete subscriber"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalSubscribers}
              itemsPerPage={pagination.subscribersPerPage}
              onPageChange={(page) => fetchSubscribers(page, statusFilter)}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterManagement;
