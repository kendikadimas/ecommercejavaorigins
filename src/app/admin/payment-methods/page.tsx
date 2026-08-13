'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Upload, Building2, QrCode } from 'lucide-react';
import { PaymentMethodType } from '@/lib/seed-data';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminPaymentMethodsPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  const [methods, setMethods] = useState<PaymentMethodType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodType | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Transfer Bank BCA',
    bankName: 'BCA',
    accountNumber: '1234567890',
    accountName: 'Java Origins Indonesia',
    qrCodeUrl: '',
    instructions: 'Transfer sesuai nominal unik, lalu upload foto bukti transfer.',
    active: true,
  });

  const fetchMethods = async () => {
    try {
      const res = await fetch(`/api/payment-methods?t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) setMethods(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const openCreateModal = () => {
    setEditingMethod(null);
    setFormData({
      name: 'Transfer Bank BCA',
      bankName: 'BCA',
      accountNumber: '8830123456',
      accountName: 'PT Java Origins Herbal',
      qrCodeUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      instructions: 'Please transfer the total amount, then upload your payment proof on the order status page.',
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: PaymentMethodType) => {
    setEditingMethod(item);
    setFormData({
      name: item.name,
      bankName: item.bankName,
      accountNumber: item.accountNumber,
      accountName: item.accountName,
      qrCodeUrl: item.qrCodeUrl || '',
      instructions: item.instructions || '',
      active: item.active,
    });
    setIsModalOpen(true);
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
        setFormData((prev) => ({ ...prev, qrCodeUrl: resData.url }));
      } else {
        alert(resData.error || 'Failed to upload QRIS image');
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
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      accountName: formData.accountName,
      qrCodeUrl: formData.qrCodeUrl,
      instructions: formData.instructions,
      active: formData.active,
    };

    if (editingMethod) {
      await fetch('/api/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingMethod.id, ...payload }),
      });
    } else {
      await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setIsModalOpen(false);
    fetchMethods();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    await fetch(`/api/payment-methods?id=${id}`, { method: 'DELETE' });
    fetchMethods();
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
            Manage Payment Methods
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#D97706] hover:bg-[#B45309] text-white font-extrabold px-6 py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 text-xs uppercase tracking-wider shadow-md"
        >
          <Plus size={18} />
          <span>Add New Method</span>
        </button>
      </div>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.map((m) => (
          <div
            key={m.id}
            className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 ${
              isLight ? 'bg-white border-[#E6DEC9] text-[#2C1D11]' : 'bg-[#231911] border-white/10 text-white'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 size={20} className="text-[#D97706]" />
                  <h3 className="text-base font-bold">{m.name}</h3>
                </div>
                {m.active ? (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Inactive
                  </span>
                )}
              </div>

              <div
                className={`p-4 rounded-xl border space-y-1 text-xs ${
                  isLight ? 'bg-[#FAF8F5] border-[#E6DEC9]' : 'bg-[#140E0A] border-white/10'
                }`}
              >
                <p className="text-gray-500 font-normal">Account Number / QRIS ID:</p>
                <p
                  className={`font-mono text-base font-extrabold select-all ${
                    isLight ? 'text-[#B45309]' : 'text-[#FACC15]'
                  }`}
                >
                  {m.accountNumber}
                </p>
                <p className="font-normal">
                  Account Name: <strong className="font-bold">{m.accountName}</strong>
                </p>
              </div>

              {m.qrCodeUrl && (
                <div
                  className={`flex items-center space-x-3 p-3 rounded-xl border ${
                    isLight ? 'bg-[#FAF8F5] border-[#E6DEC9]' : 'bg-[#140E0A] border-white/10'
                  }`}
                >
                  <div className="w-14 h-14 relative rounded border overflow-hidden bg-white flex-shrink-0">
                    <img src={m.qrCodeUrl} alt="QRIS Code" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-[11px]">
                    <span className="font-bold text-[#D97706] flex items-center">
                      <QrCode size={14} className="mr-1" /> QRIS Active
                    </span>
                    <p className="text-gray-500 font-normal line-clamp-1">{m.qrCodeUrl}</p>
                  </div>
                </div>
              )}
            </div>

            <div className={`pt-4 border-t flex justify-end space-x-2 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
              <button
                onClick={() => openEditModal(m)}
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
                onClick={() => handleDelete(m.id)}
                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white border border-red-300 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto font-sans">
          <div
            className={`border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col my-auto max-h-[85vh] sm:max-h-[90vh] ${
              isLight ? 'bg-white border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#231911] border-[#FACC15]/30 text-white'
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-black/10 sticky top-0 z-10 rounded-t-2xl">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#D97706]">
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={isLight ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Method Display Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                    isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                  }`}
                  placeholder="Contoh: Transfer Bank BCA / QRIS All Payment"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Bank / Provider Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                      isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                    }`}
                    placeholder="BCA / Mandiri / QRIS"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Account Number / QRIS ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                      isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                    isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                  }`}
                />
              </div>

              {/* QRIS Image */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">QRIS Code Image (Upload File / Link URL)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={formData.qrCodeUrl}
                    onChange={(e) => setFormData({ ...formData, qrCodeUrl: e.target.value })}
                    className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                      isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                    }`}
                    placeholder="https://... atau /uploads/..."
                  />
                  <label className="px-4 py-2.5 bg-[#D97706] text-white rounded-xl text-xs font-extrabold cursor-pointer hover:bg-[#B45309] flex items-center justify-center space-x-1 whitespace-nowrap">
                    <Upload size={14} />
                    <span>{uploading ? 'Mengunggah...' : 'Upload QRIS'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {formData.qrCodeUrl && (
                  <div
                    className={`mt-3 p-3 rounded-xl border space-y-1 ${
                      isLight ? 'bg-[#FAF8F5] border-[#D6CBB8]' : 'bg-[#140E0A] border-white/10'
                    }`}
                  >
                    <p className="text-xs font-bold text-[#D97706]">Preview QRIS:</p>
                    <div className="w-32 h-32 relative rounded-lg overflow-hidden border border-gray-300 bg-white mx-auto">
                      <img src={formData.qrCodeUrl} alt="Preview QRIS" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Instructions</label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none font-normal ${
                    isLight ? 'bg-[#FAF8F5] border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#140E0A] border-white/10 text-white'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="activeMethodCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded text-[#D97706] focus:ring-[#D97706]"
                />
                <label htmlFor="activeMethodCheck" className="text-xs font-semibold text-gray-600">
                  Show This Method at Checkout
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
                  className="px-6 py-2.5 rounded-xl bg-[#D97706] text-white text-xs font-extrabold uppercase hover:bg-[#B45309]"
                >
                  Save Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
