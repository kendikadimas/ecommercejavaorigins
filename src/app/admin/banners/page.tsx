'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Upload, ExternalLink, AlertCircle } from 'lucide-react';
import { BannerType } from '@/lib/seed-data';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminBannersPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  const [banners, setBanners] = useState<BannerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerType | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchBanners = async () => {
    try {
      const res = await fetch(`/api/banners?t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) setBanners(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '/shop',
    active: true,
    sortOrder: '1',
  });

  const openCreateModal = () => {
    setErrorMsg('');
    setEditingBanner(null);
    setFormData({
      title: 'THE JAVA ORIGINS DRINK',
      subtitle: 'Java Drink is a natural herbal beverage made from carefully selected Indonesian herbs...',
      imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1600&q=80',
      linkUrl: '/shop',
      active: true,
      sortOrder: String(banners.length + 1),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: BannerType) => {
    setErrorMsg('');
    setEditingBanner(item);
    setFormData({
      title: item.title,
      subtitle: item.subtitle || '',
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl,
      active: item.active,
      sortOrder: String(item.sortOrder),
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const resData = await res.json();
      if (resData.url) {
        setFormData((prev) => ({ ...prev, imageUrl: resData.url }));
      } else {
        setErrorMsg(resData.error || 'Failed to upload banner image');
      }
    } catch (err) {
      setErrorMsg('Failed to upload banner from folder.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.imageUrl) {
      setErrorMsg('Banner image is required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      title: formData.title,
      subtitle: formData.subtitle,
      imageUrl: formData.imageUrl,
      linkUrl: formData.linkUrl,
      active: formData.active,
      sortOrder: Number(formData.sortOrder) || 1,
    };

    try {
      if (editingBanner) {
        const res = await fetch('/api/banners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBanner.id, ...payload }),
        });

        const updated = await res.json();
        if (!res.ok) throw new Error(updated.error || 'Failed to update banner');

        setBanners((prev) => prev.map((b) => (b.id === editingBanner.id ? { ...b, ...updated } : b)));
      } else {
        const res = await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const created = await res.json();
        if (!res.ok) throw new Error(created.error || 'Failed to create banner');

        setBanners((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while saving the banner.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert('Failed to delete banner.');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus banner.');
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 ${
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
            Kelola Banner Homepage
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#D97706] hover:bg-[#B45309] text-white font-extrabold px-6 py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 text-xs uppercase tracking-wider shadow-md"
        >
          <Plus size={18} />
          <span>Tambah Banner Baru</span>
        </button>
      </div>

      {/* Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className={`border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between ${
              isLight ? 'bg-white border-[#E6DEC9] text-[#2C1D11]' : 'bg-[#231911] border-white/10 text-white'
            }`}
          >
            <div className="relative aspect-video bg-black">
              <img
                src={b.imageUrl}
                alt={b.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute top-3 left-3 bg-[#140E0A]/90 text-[#FACC15] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#FACC15]/30">
                Urutan: #{b.sortOrder}
              </div>
              <div className="absolute top-3 right-3">
                {b.active ? (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    Aktif
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    Non-Aktif
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#D97706] line-clamp-1">{b.title}</h3>
                <p className="text-xs text-gray-600 font-normal line-clamp-2 mt-1">{b.subtitle}</p>
                <div className="mt-3 flex items-center text-xs text-gray-500 space-x-1 font-normal">
                  <ExternalLink size={14} className="text-[#D97706]" />
                  <span>Link: <strong className="font-semibold">{b.linkUrl}</strong></span>
                </div>
              </div>

              <div className={`pt-4 border-t flex justify-end space-x-2 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                <button
                  onClick={() => openEditModal(b)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 border ${
                    isLight
                      ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A] hover:bg-[#FDE68A]'
                      : 'bg-[#2E2016] text-[#FACC15] border-transparent hover:bg-[#FACC15] hover:text-[#140E0A]'
                  }`}
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white border border-red-300 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto font-sans">
          <div
            className={`border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col my-auto max-h-[85vh] sm:max-h-[90vh] ${
              isLight ? 'bg-white border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#231911] border-[#FACC15]/30 text-white'
            }`}
          >
            
            {/* Sticky Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-black/10 sticky top-0 z-10 rounded-t-2xl">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#D97706]">
                {editingBanner ? 'Edit Banner Slider' : 'Tambah Banner Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={isLight ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Judul Banner *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                    isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Sub-Judul / Deskripsi Banner</label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                    isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                  }`}
                />
              </div>

              {/* Image Input with Live Preview */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Banner Image (Upload File / Link URL) *</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                      isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                    }`}
                    placeholder="https://... atau /uploads/..."
                  />
                  <label className="px-4 py-2.5 bg-[#D97706] text-white rounded-xl text-xs font-extrabold cursor-pointer hover:bg-[#B45309] flex items-center justify-center space-x-1 whitespace-nowrap">
                    <Upload size={14} />
                    <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Live Banner Preview Box */}
                {formData.imageUrl && (
                  <div
                    className={`mt-3 p-3 rounded-xl border space-y-1 ${
                      isLight ? 'bg-[#FAF8F5] border-[#D6CBB8]' : 'bg-[#140E0A] border-white/10'
                    }`}
                  >
                    <p className="text-xs font-bold text-[#D97706]">Banner Preview:</p>
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-black/10 bg-black">
                      <img src={formData.imageUrl} alt="Preview Banner" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Link Tujuan (Routing URL)</label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                      isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                    }`}
                    placeholder="/shop"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Urutan (Sort Order)</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                      isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="activeBannerCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded text-[#D97706] focus:ring-[#D97706]"
                />
                <label htmlFor="activeBannerCheck" className="text-xs font-semibold text-gray-600">
                  Show Banner on Homepage Hero Slider
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#D97706] text-white text-xs font-extrabold uppercase hover:bg-[#B45309]"
                >
                  {submitting ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
