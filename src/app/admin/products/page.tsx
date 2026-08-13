'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Upload, Tags, Search, Filter } from 'lucide-react';
import { ProductType } from '@/lib/seed-data';
import { formatPrice } from '@/lib/format';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminProductsPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<string[]>([
    'Herbal Beverage',
    'Honey & Elixir',
    'Herbal Powder',
    'Herbal Tea',
  ]);

  const [loading, setLoading] = useState(true);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [uploading, setUploading] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Category Management State
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editingCatText, setEditingCatText] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Herbal Beverage',
    price: '',
    stock: '100',
    image: '',
    description: '',
    ingredients: '',
    active: true,
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
        const extracted = Array.from(new Set(data.map((p: ProductType) => p.category)));
        if (extracted.length > 0) {
          setCategories((prev) => Array.from(new Set([...prev, ...extracted])));
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    const trimmed = newCatInput.trim();
    if (!categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
    }
    setNewCatInput('');
  };

  const handleEditCategory = (index: number) => {
    setEditingCatIndex(index);
    setEditingCatText(categories[index]);
  };

  const handleSaveCategoryEdit = (index: number) => {
    if (!editingCatText.trim()) return;
    const updated = [...categories];
    updated[index] = editingCatText.trim();
    setCategories(updated);
    setEditingCatIndex(null);
    setEditingCatText('');
  };

  const handleDeleteCategory = (index: number) => {
    if (!confirm(`Delete category "${categories[index]}"?`)) return;
    setCategories(categories.filter((_, i) => i !== index));
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0] || 'Herbal Beverage',
      price: '14.99',
      stock: '100',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
      description: 'Java Drink is a natural herbal beverage made from carefully selected Indonesian herbs...',
      ingredients: 'Ginger, Turmeric, Lemongrass, Palm Sugar, Honey',
      active: true,
    });
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: ProductType) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      image: product.image,
      description: product.description,
      ingredients: product.ingredients || '',
      active: product.active,
    });
    setIsProductModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const resData = await res.json();
      if (resData.url) {
        setFormData((prev) => ({ ...prev, image: resData.url }));
      } else {
        alert(resData.error || 'Failed to upload image');
      }
    } catch (err) {
      alert('Failed to upload image from folder.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      image: formData.image,
      description: formData.description,
      ingredients: formData.ingredients,
      active: formData.active,
    };

    if (editingProduct) {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingProduct.id, ...payload }),
      });
    } else {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setIsProductModalOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'ALL' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${
          isLight ? 'border-[#E6DEC9]' : 'border-white/10'
        }`}
      >
        <div>
          <span
            className={`text-xs font-bold uppercase tracking-widest ${
              isLight ? 'text-[#B45309]' : 'text-[#FACC15]'
            }`}
          >
            ADMIN DASHBOARD
          </span>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold mt-1 ${
              isLight ? 'text-[#2C1D11]' : 'text-white'
            }`}
          >
            Manage Java Origins Products
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className={`font-bold px-5 py-3 rounded-xl transition-all flex items-center space-x-2 text-xs uppercase tracking-wider shadow-sm border ${
              isLight
                ? 'bg-white text-[#2C1D11] border-[#D6CBB8] hover:bg-[#F5EFE6]'
                : 'bg-[#2E2016] text-[#FACC15] border-[#FACC15]/40 hover:bg-[#FACC15] hover:text-[#140E0A]'
            }`}
          >
            <Tags size={18} />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={openCreateModal}
            className="bg-[#D97706] hover:bg-[#B45309] text-white font-extrabold px-6 py-3 rounded-xl transition-colors flex items-center space-x-2 text-xs uppercase tracking-wider shadow-md"
          >
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div
        className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border shadow-sm ${
          isLight ? 'bg-white border-[#E6DEC9]' : 'bg-[#231911] border-white/10'
        }`}
      >
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none font-normal ${
              isLight
                ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11] focus:border-[#D97706]'
                : 'bg-[#140E0A] border-white/10 text-white focus:border-[#FACC15]'
            }`}
          />
          <Search
            size={16}
            className={`absolute left-3 top-2.5 ${isLight ? 'text-[#786C60]' : 'text-gray-400'}`}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <span
            className={`text-xs font-semibold flex items-center ${
              isLight ? 'text-[#5C4D40]' : 'text-gray-400'
            }`}
          >
            <Filter size={14} className="mr-1 text-[#D97706]" /> Category Filter:
          </span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className={`border px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none ${
              isLight
                ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]'
                : 'bg-[#140E0A] border-white/10 text-[#FACC15]'
            }`}
          >
            <option value="ALL">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div
        className={`border rounded-2xl overflow-hidden shadow-sm ${
          isLight ? 'bg-white border-[#E6DEC9]' : 'bg-[#231911] border-white/10'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`uppercase tracking-wider font-bold border-b ${
                isLight
                  ? 'bg-[#2A1D13] text-[#FACC15] border-[#E6DEC9]'
                  : 'bg-[#140E0A] text-[#FACC15] border-white/10'
              }`}
            >
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price ($ NZD)</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isLight
                  ? 'divide-[#F0EAE1] text-[#2C1D11]'
                  : 'divide-white/5 text-gray-300'
              }`}
            >
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-400 font-normal text-sm">
                    Loading product data...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`text-center p-8 font-normal text-sm ${
                      isLight ? 'text-[#786C60]' : 'text-gray-400'
                    }`}
                  >
                    No products match the search / category.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isLight ? 'hover:bg-[#FAF6F0]' : 'hover:bg-[#2E2016]'
                    }`}
                  >
                    <td className="p-4 flex items-center space-x-3">
                      <div
                        className={`relative w-12 h-12 rounded-lg overflow-hidden border flex-shrink-0 ${
                          isLight
                            ? 'bg-[#FAF8F5] border-[#D6CBB8]'
                            : 'bg-[#140E0A] border-white/10'
                        }`}
                      >
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p
                          className={`font-bold text-sm ${
                            isLight ? 'text-[#2C1D11]' : 'text-white'
                          }`}
                        >
                          {p.name}
                        </p>
                        <p
                          className={`text-[11px] font-normal line-clamp-1 max-w-xs ${
                            isLight ? 'text-[#786C60]' : 'text-gray-400'
                          }`}
                        >
                          {p.description}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isLight
                            ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                            : 'bg-[#140E0A] text-[#FACC15] border-[#FACC15]/20'
                        }`}
                      >
                        {p.category}
                      </span>
                    </td>
                    <td
                      className={`p-4 font-extrabold text-sm ${
                        isLight ? 'text-[#B45309]' : 'text-white'
                      }`}
                    >
                      {formatPrice(p.price)}
                    </td>
                    <td className="p-4 font-semibold">{p.stock} pcs</td>
                    <td className="p-4">
                      {p.active ? (
                        <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          Active
                        </span>
                      ) : (
                        <span className="text-red-700 font-bold bg-red-100 px-2.5 py-0.5 rounded-full border border-red-300">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className={`p-2 rounded-lg transition-colors border ${
                          isLight
                            ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A] hover:bg-[#FDE68A]'
                            : 'bg-[#2E2016] text-[#FACC15] border-transparent hover:bg-[#FACC15] hover:text-[#140E0A]'
                        }`}
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className={`p-2 rounded-lg transition-colors border ${
                          isLight
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white'
                            : 'bg-red-950/60 text-red-400 border-transparent hover:bg-red-600 hover:text-white'
                        }`}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: KELOLA KATEGORI */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto font-sans">
          <div
            className={`rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl border ${
              isLight ? 'bg-white border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#231911] border-[#FACC15]/30 text-white'
            }`}
          >
            <div className="flex justify-between items-center border-b border-black/10 pb-4">
              <div className="flex items-center space-x-2">
                <Tags size={20} className="text-[#D97706]" />
                <h3 className="text-lg font-extrabold text-[#D97706]">Manage Product Categories</h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className={isLight ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Add New Category */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Add New Category
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Premium Tea"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  className={`flex-1 px-4 py-2.5 border rounded-xl text-xs focus:outline-none font-normal ${
                    isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                  }`}
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2.5 bg-[#D97706] text-white font-extrabold rounded-xl text-xs uppercase hover:bg-[#B45309]"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Category List */}
            <div className="space-y-2 border-t border-black/10 pt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Active Categories ({categories.length})
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                      isLight ? 'bg-[#FAF8F5] border-[#E6DEC9]' : 'bg-[#140E0A] border-white/10'
                    }`}
                  >
                    {editingCatIndex === idx ? (
                      <input
                        type="text"
                        value={editingCatText}
                        onChange={(e) => setEditingCatText(e.target.value)}
                        className="px-2 py-1 bg-white text-black rounded border border-[#D97706] text-xs font-normal"
                      />
                    ) : (
                      <span className="font-semibold">{cat}</span>
                    )}

                    <div className="flex space-x-2">
                      {editingCatIndex === idx ? (
                        <button
                          onClick={() => handleSaveCategoryEdit(idx)}
                          className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-[11px]"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditCategory(idx)}
                          className="p-1.5 text-[#D97706] hover:bg-black/10 rounded"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCategory(idx)}
                        className="p-1.5 text-red-600 hover:bg-black/10 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-6 py-2.5 bg-[#D97706] text-white font-extrabold rounded-xl text-xs uppercase hover:bg-[#B45309]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRODUK FORM */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto font-sans">
          <div
            className={`rounded-2xl w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border ${
              isLight ? 'bg-white border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#231911] border-[#FACC15]/30 text-white'
            }`}
          >
            <div className="flex justify-between items-center border-b border-black/10 pb-4">
              <h3 className="text-xl font-extrabold text-[#D97706]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className={isLight ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                    isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none ${
                      isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                    }`}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Price ($ NZD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                      isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                      isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Image Input with Live Preview */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Product Photo (Upload Folder / Link URL) *</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                      isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                    }`}
                    placeholder="https://... atau /uploads/..."
                  />
                  <label className="px-4 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors flex items-center space-x-1">
                    <Upload size={14} />
                    <span>{uploading ? 'Uploading...' : 'Choose Photo Folder'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Live Image Preview Box */}
                {formData.image && (
                  <div
                    className={`mt-3 p-3 rounded-xl border flex items-center space-x-3 ${
                      isLight ? 'bg-[#FAF8F5] border-[#D6CBB8]' : 'bg-[#140E0A] border-white/10'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-black/10 bg-black flex-shrink-0 relative">
                      <img
                        src={formData.image}
                        alt="Image Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-xs space-y-0.5 overflow-hidden">
                      <p className="font-bold text-[#D97706]">Product Photo Preview</p>
                      <p className="text-[11px] text-gray-500 truncate max-w-xs font-normal">{formData.image}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                    isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ingredients</label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                    isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                  }`}
                  placeholder="Red Ginger, Turmeric, Lemongrass, Palm Sugar"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded text-[#D97706] focus:ring-[#D97706]"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-gray-600">
                  Show Product in Store Catalog (Active)
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#D97706] text-white text-xs font-extrabold uppercase hover:bg-[#B45309]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
