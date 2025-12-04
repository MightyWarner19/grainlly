'use client';
import React, { useEffect, useState } from "react";
import { assets, orderDummyData } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const Category = () => {
    const { getToken, user } = useAppContext();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    const fetchCategories = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get(
                '/api/category',
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setCategories(Array.isArray(data.data) ? data.data : [])
                setLoading(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return toast.error('Enter category name');
        try {
            setCreating(true);
            const token = await getToken();
            const { data } = await axios.post('/api/category', { name }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                setCategories((prev) => [data.data, ...prev]);
                setNewName("");
                toast.success('Category created');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setCreating(false);
        }
    }

    const startEdit = (category) => {
        setEditingId(category._id);
        setEditingName(category.name);
    }

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    }

    const saveEdit = async (id) => {
        const name = editingName.trim();
        if (!name) return toast.error('Name cannot be empty');
        try {
            const token = await getToken();
            const { data } = await axios.patch(`/api/category/${id}`, { name }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                setCategories((prev) => prev.map((c) => c._id === id ? data.data : c));
                toast.success('Category updated');
                cancelEdit();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const deleteCategory = async (id) => {
        if (!confirm('Delete this category?')) return;
        try {
            const token = await getToken();
            const { data } = await axios.delete(`/api/category/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                setCategories((prev) => prev.filter((c) => c._id !== id));
                toast.success('Category deleted');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if (user) {
            fetchCategories();
        }
    }, [user]);

    return (
        <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
            {loading ? <Loading /> : <div className="md:p-10 p-4 space-y-5">
                <h2 className="text-lg font-medium">Categories</h2>
                <form onSubmit={handleCreate} className="flex gap-2 max-w-md">
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="New category name"
                        className="border px-3 py-2 rounded w-full"
                    />
                    <button disabled={creating} className="bg-lime-700/90 hover:bg-lime-700 text-white px-4 py-2 rounded cursor-pointer">
                        {creating ? 'Adding...' : 'Add'}
                    </button>
                </form>
                <div className="max-w-4xl rounded-md">
                    {categories.map((category) => (
                        <div key={category._id} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300">
                            <div className="flex-1 flex gap-5 max-w-80">
                                {editingId === category._id ? (
                                    <div className="flex gap-2 w-full">
                                        <input
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className="border px-3 py-2 rounded w-full"
                                        />
                                        <button onClick={() => saveEdit(category._id)} className="bg-green-600 text-white px-3 py-2 rounded">Save</button>
                                        <button onClick={cancelEdit} className="bg-gray-200 px-3 py-2 rounded">Cancel</button>
                                    </div>
                                ) : (
                                    <p className="flex flex-col gap-3">
                                        <span className="font-medium">{category.name}</span>
                                        <span>ID : {category._id}</span>
                                    </p>
                                )}
                            </div>
                            <div className="my-auto">
                                <p className="flex flex-col">
                                    <span>Date : {new Date(category.date).toISOString().slice(0, 10)}</span>
                                </p>
                            </div>
                            <div className="flex gap-2 my-auto">
                                {editingId === category._id ? null : (
                                    <button onClick={() => startEdit(category)} className="px-3 py-2 border rounded">Edit</button>
                                )}
                                <button onClick={() => deleteCategory(category._id)} className="px-3 py-2 border rounded text-red-600 border-red-600">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>}
          
        </div>
    );
};

export default Category;