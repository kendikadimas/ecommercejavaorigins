'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Clock, Upload, ArrowLeft, Building2, AlertCircle, ShieldCheck, Truck, XCircle } from 'lucide-react';
import { OrderType } from '@/lib/store';
import { formatPrice } from '@/lib/format';

export default function OrderStatusPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/orders?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setOrder(data);
          if (data.paymentProofUrl) {
            setProofUrl(data.paymentProofUrl);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to upload photo');

      const uploadedUrl = uploadData.url;
      setProofUrl(uploadedUrl);

      const updateRes = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order?.id,
          status: 'WAITING_APPROVAL',
          paymentProofUrl: uploadedUrl,
        }),
      });

      const updatedOrder = await updateRes.json();
      if (updateRes.ok) {
        setOrder(updatedOrder);
        setMessage('Payment proof uploaded successfully! Order is awaiting Admin approval.');
      }
    } catch (err: any) {
      setMessage('Failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FAFAF7] min-h-screen py-20 text-center font-sans">
        <p className="text-[#140E0A] text-base font-semibold">Loading Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#FAFAF7] min-h-screen py-20 text-center font-sans">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl border border-[#E6E0D4] space-y-4 shadow-sm">
          <AlertCircle size={40} className="mx-auto text-amber-500" />
          <h2 className="text-2xl font-bold text-[#140E0A]">Order Not Found</h2>
          <p className="text-xs text-gray-500">Order number or ID is not valid.</p>
          <Link
            href="/shop"
            className="inline-block bg-[#140E0A] text-[#FACC15] font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: OrderType['status']) => {
    switch (status) {
      case 'WAITING_APPROVAL':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock size={14} className="mr-1.5" /> Awaiting Admin Approval
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 size={14} className="mr-1.5" /> Payment Approved (PAID)
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Truck size={14} className="mr-1.5" /> Out for Delivery
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <XCircle size={14} className="mr-1.5" /> Payment Rejected by Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
            <Clock size={14} className="mr-1.5" /> Awaiting Payment Proof Upload
          </span>
        );
    }
  };

  return (
    <div className="bg-[#FAFAF7] min-h-screen py-10 text-[#140E0A] font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center justify-between">
          <Link href="/shop" className="text-xs text-[#786C60] hover:text-[#EAB308] font-semibold flex items-center">
            <ArrowLeft size={16} className="mr-1" /> Back to Catalog
          </Link>
          <span className="text-xs font-mono font-bold bg-white px-3 py-1 rounded-lg border border-[#E6E0D4]">
            ID: {order.orderNumber}
          </span>
        </div>

        {/* Top Status Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E6E0D4] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5EFE6] pb-4">
            <div>
              <p className="text-xs text-[#786C60] font-semibold uppercase tracking-wider">Order Status</p>
              <h1 className="text-2xl font-extrabold text-[#140E0A] mt-1">
                Order #{order.orderNumber}
              </h1>
            </div>
            <div>{getStatusBadge(order.status)}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-gray-400 block font-normal">Customer Name:</span>
              <span className="font-semibold text-[#140E0A]">{order.customerName}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-normal">Phone / WA:</span>
              <span className="font-semibold text-[#140E0A]">{order.customerPhone}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-normal">Total Bill:</span>
              <span className="text-base font-extrabold text-[#140E0A]">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Instructions & Upload Bukti Pembayaran */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Bank / QRIS Details */}
          <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-[#E6E0D4] shadow-sm space-y-4">
            <h3 className="text-lg font-bold border-b border-[#F5EFE6] pb-3 text-[#140E0A]">
              Transfer Payment Instructions
            </h3>

            {order.paymentMethod ? (
              <div className="space-y-3">
                <div className="p-4 bg-[#FFFDF6] border border-[#EAB308]/30 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-sm text-[#140E0A]">
                    <Building2 size={18} className="text-[#EAB308]" />
                    <span>{order.paymentMethod.name} ({order.paymentMethod.bankName})</span>
                  </div>
                  <p className="text-xs text-[#786C60] font-normal">
                    Account Number:
                  </p>
                  <p className="font-mono text-xl font-extrabold text-[#140E0A] tracking-wider select-all">
                    {order.paymentMethod.accountNumber}
                  </p>
                  <p className="text-xs text-[#786C60] font-normal">
                    Account Name: <span className="font-bold text-[#140E0A]">{order.paymentMethod.accountName}</span>
                  </p>
                </div>

                {order.paymentMethod.qrCodeUrl && (
                  <div className="text-center p-4 bg-[#FAFAF7] rounded-xl border border-[#E6E0D4] space-y-2">
                    <p className="text-xs font-bold text-[#3A2B20]">Scan QRIS to Pay</p>
                    <div className="relative w-48 h-48 mx-auto border rounded-lg overflow-hidden bg-white">
                      <Image src={order.paymentMethod.qrCodeUrl} alt="QRIS Code" fill className="object-contain" />
                    </div>
                  </div>
                )}

                {order.paymentMethod.instructions && (
                  <p className="text-xs text-[#786C60] bg-[#F5EFE6] p-3 rounded-lg font-normal">
                    {order.paymentMethod.instructions}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">Direct payment / WhatsApp.</p>
            )}
          </div>

          {/* Right Column: Upload Bukti Pembayaran */}
          <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-[#E6E0D4] shadow-sm space-y-4">
            <h3 className="text-lg font-bold border-b border-[#F5EFE6] pb-3 text-[#140E0A]">
              Submit Payment Proof
            </h3>

            {message && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {proofUrl ? (
              <div className="space-y-3">
                <p className="text-xs text-[#786C60] font-normal">Transfer Proof Uploaded:</p>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-[#E6E0D4] bg-[#FAFAF7]">
                  <Image src={proofUrl} alt="Bukti Pembayaran" fill className="object-cover" />
                </div>
                <div className="text-center">
                  <label className="inline-block text-xs font-semibold text-[#EAB308] cursor-pointer hover:underline">
                    Change Transfer Proof Photo
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#786C60] font-normal">
                  Please upload a photo/screenshot of your transfer receipt to verify this order.
                </p>

                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#E6E0D4] hover:border-[#EAB308] rounded-2xl cursor-pointer bg-[#FAFAF7] hover:bg-[#FFFDF6] transition-colors">
                  <Upload size={32} className="text-[#EAB308] mb-2" />
                  <span className="text-sm font-bold text-[#140E0A]">Choose Receipt / Transfer Proof Photo</span>
                  <span className="text-[11px] text-gray-400 mt-1 font-normal">Format PNG, JPG, JPEG (Max 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {uploading && (
                  <p className="text-xs text-amber-600 font-semibold text-center animate-pulse">
                    Uploading payment proof photo...
                  </p>
                )}
              </div>
            )}

            <div className="pt-2 text-xs text-gray-500 space-y-1.5 border-t border-[#F5EFE6] font-normal">
              <p>Our admin will check the transfer proof within 24 hours.</p>
              <p>Need quick confirmation? Contact Admin WhatsApp and attach your Order ID.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
