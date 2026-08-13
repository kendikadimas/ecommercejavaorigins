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
        setProofUrl(uploadedUrl);
        setOrder(updatedOrder);
        setMessage('Payment proof uploaded successfully! Order is awaiting Admin approval.');
      } else {
        setMessage(updatedOrder.error || 'Failed to save payment proof.');
      }
    } catch (err: any) {
      setMessage('Failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-20 text-center font-sans">
        <p className="text-[#140E0A] text-base font-semibold">Loading Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white min-h-screen py-20 text-center font-sans">
        <div className="max-w-md mx-auto p-8 bg-[#EEF6E0] rounded-2xl border border-[#B4D397] space-y-4 shadow-sm">
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
    <div className="bg-white min-h-screen py-10 text-[#140E0A] font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center justify-between">
          <Link href="/shop" className="text-xs text-[#5A7543] hover:text-[#276F27] font-semibold flex items-center">
            <ArrowLeft size={16} className="mr-1" /> Back to Catalog
          </Link>
          <span className="text-xs font-mono font-bold bg-white px-3 py-1 rounded-lg border border-[#CBE0B4]">
            ID: {order.orderNumber}
          </span>
        </div>

        {/* Top Status Header */}
        <div className="bg-[#EEF6E0] p-6 sm:p-8 rounded-2xl border border-[#B4D397] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAF3DB] pb-4">
            <div>
              <p className="text-xs text-[#5A7543] font-semibold uppercase tracking-wider">Order Status</p>
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

          {order.shippingMethod && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-[#E0E6D8] text-xs">
              <div>
                <span className="text-gray-400 block font-normal">Shipping Option:</span>
                <span className="font-bold text-[#140E0A]">{order.shippingMethod}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-normal">Shipping Cost:</span>
                <span className="font-bold text-[#140E0A]">
                  {formatPrice(order.shippingCost ?? 0)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Instructions & Upload Bukti Pembayaran */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Bank / QRIS Details */}
          <div className="md:col-span-6 bg-[#EEF6E0] p-6 rounded-2xl border border-[#B4D397] shadow-sm space-y-4">
            <h3 className="text-lg font-bold border-b border-[#EAF3DB] pb-3 text-[#140E0A]">
              Transfer Payment Instructions
            </h3>

            {order.paymentMethod ? (
              <div className="space-y-3">
                <div className="p-4 bg-[#FFFDF6] border border-[#499A13]/30 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-base text-[#140E0A]">
                    <Building2 size={20} className="text-[#499A13]" />
                    <span>{order.paymentMethod.bankName}</span>
                  </div>
                  <p className="text-xs text-[#5A7543] font-normal">
                    Account Name: <span className="font-bold text-[#140E0A]">{order.paymentMethod.accountName}</span>
                  </p>
                  {order.paymentMethod.accountNumber && (
                    <>
                      <p className="text-xs text-[#5A7543] font-normal">
                        Account Number:
                      </p>
                      <p className="font-mono text-xl font-extrabold text-[#140E0A] tracking-wider select-all">
                        {order.paymentMethod.accountNumber}
                      </p>
                    </>
                  )}
                </div>

                {order.paymentMethod.qrCodeUrl && (
                  <div className="text-center p-4 bg-[#FAFAF7] rounded-xl border border-[#CBE0B4] space-y-2">
                    <p className="text-xs font-bold text-[#22491F]">Scan QRIS to Pay</p>
                    <div className="relative w-48 h-48 mx-auto border rounded-lg overflow-hidden bg-white">
                      <Image src={order.paymentMethod.qrCodeUrl} alt="QRIS Code" fill className="object-contain" />
                    </div>
                  </div>
                )}

                {order.paymentMethod.instructions && (
                  <div className="p-4 bg-[#EAF3DB] rounded-xl space-y-2 text-xs font-mono text-[#22491F]">
                    <p className="text-[11px] font-sans font-bold text-[#5A7543] uppercase tracking-wider">
                      Reference Details for ASB Bank Transfer:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="bg-white p-2.5 rounded-lg border border-[#CBE0B4] flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-[#276F27] uppercase">PARTICULAR</span>
                        <span className="font-bold text-[#140E0A] text-xs sm:text-sm select-all mt-0.5">{order.customerName}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-[#CBE0B4] flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-[#276F27] uppercase">CODE</span>
                        <span className="font-bold text-[#140E0A] text-xs sm:text-sm select-all mt-0.5">{formatPrice(order.totalAmount)}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-[#CBE0B4] flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-[#276F27] uppercase">REF</span>
                        <span className="font-bold text-[#140E0A] text-xs sm:text-sm select-all mt-0.5">{order.orderNumber}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">Direct payment / WhatsApp.</p>
            )}
          </div>

          {/* Right Column: Upload Bukti Pembayaran */}
          <div className="md:col-span-6 bg-[#EEF6E0] p-6 rounded-2xl border border-[#B4D397] shadow-sm space-y-4">
            <h3 className="text-lg font-bold border-b border-[#EAF3DB] pb-3 text-[#140E0A]">
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
                <p className="text-xs text-[#5A7543] font-normal">Transfer Proof Uploaded:</p>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-[#CBE0B4] bg-[#FAFAF7]">
                  <Image src={proofUrl} alt="Bukti Pembayaran" fill className="object-cover" />
                </div>
                <div className="text-center">
                  <label className="inline-block text-xs font-semibold text-[#499A13] cursor-pointer hover:underline">
                    Change Transfer Proof Photo
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#5A7543] font-normal">
                  Please upload a photo/screenshot of your transfer receipt to verify this order.
                </p>

                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#CBE0B4] hover:border-[#499A13] rounded-2xl cursor-pointer bg-[#FAFAF7] hover:bg-[#FFFDF6] transition-colors">
                  <Upload size={32} className="text-[#499A13] mb-2" />
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

            <div className="pt-2 text-xs text-gray-500 space-y-1.5 border-t border-[#EAF3DB] font-normal">
              <p>Our admin will check the transfer proof within 24 hours.</p>
              <p>Need quick confirmation? Contact Admin WhatsApp and attach your Order ID.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
