'use client';

import React, { useState, useEffect } from 'react';
import { Eye, X, MessageSquare, CreditCard, CheckCircle2, Clock, Truck, XCircle } from 'lucide-react';
import { OrderType } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminOrdersPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderType | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: OrderType['status']) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
        if (selectedOrderDetails?.id === id) {
          setSelectedOrderDetails(updated);
        }
      }
    } catch {
      alert('Failed to update order approval status.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  const getStatusBadge = (status: OrderType['status']) => {
    switch (status) {
      case 'WAITING_APPROVAL':
        return (
          <span className="inline-flex items-center bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <Clock size={12} className="mr-1 text-amber-700" /> Awaiting Admin Approval
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <CheckCircle2 size={12} className="mr-1 text-emerald-700" /> Payment Approved
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <Truck size={12} className="mr-1 text-blue-700" /> Out for Delivery
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center bg-red-100 text-red-900 border border-red-300 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <XCircle size={12} className="mr-1 text-red-700" /> Payment Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <Clock size={12} className="mr-1 text-gray-500" /> Awaiting Payment
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-6 ${
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
            Manage Orders & Approve Payments
          </h1>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Statuses', activeClass: 'bg-[#D97706] text-white' },
            { id: 'WAITING_APPROVAL', label: 'Pending Approval', activeClass: 'bg-amber-500 text-white' },
            { id: 'PAID', label: 'Approved / Paid', activeClass: 'bg-emerald-600 text-white' },
            { id: 'SHIPPED', label: 'Shipped', activeClass: 'bg-blue-600 text-white' },
            { id: 'REJECTED', label: 'Rejected', activeClass: 'bg-red-600 text-white' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                filterStatus === st.id
                  ? `${st.activeClass}`
                  : isLight
                  ? 'bg-white text-[#5C4D40] border border-[#E6DEC9] hover:bg-[#FAF6F0]'
                  : 'bg-[#2E2016] text-gray-300 hover:bg-white/10'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div
        className={`border rounded-2xl overflow-hidden shadow-sm ${
          isLight ? 'bg-white border-[#E6DEC9]' : 'bg-[#231911] border-white/10'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead
              className={`uppercase tracking-wider font-bold border-b ${
                isLight
                  ? 'bg-[#2A1D13] text-[#FACC15] border-[#E6DEC9]'
                  : 'bg-[#140E0A] text-[#FACC15] border-white/10'
              }`}
            >
              <tr>
                <th className="p-4">Order No. / Customer</th>
                <th className="p-4">Checkout Flow</th>
                <th className="p-4">Total Bill</th>
                <th className="p-4">Transfer Proof</th>
                <th className="p-4">Approval Status</th>
                <th className="p-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isLight ? 'divide-[#F0EAE1] text-[#2C1D11]' : 'divide-white/5 text-gray-300'
              }`}
            >
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-400 font-normal text-sm">
                    Loading orders list...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`text-center p-8 font-normal text-sm ${
                      isLight ? 'text-[#786C60]' : 'text-gray-400'
                    }`}
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={`transition-colors ${
                      isLight ? 'hover:bg-[#FAF6F0]' : 'hover:bg-[#2E2016]'
                    }`}
                  >
                    <td className="p-4 space-y-1">
                      <p
                        className={`font-mono font-extrabold text-sm ${
                          isLight ? 'text-[#B45309]' : 'text-[#FACC15]'
                        }`}
                      >
                        #{order.orderNumber}
                      </p>
                      <p className={`font-bold text-xs ${isLight ? 'text-[#2C1D11]' : 'text-white'}`}>
                        {order.customerName}
                      </p>
                      <p className={`text-[11px] font-normal ${isLight ? 'text-[#786C60]' : 'text-gray-400'}`}>
                        Phone: {order.customerPhone}
                      </p>
                    </td>

                    <td className="p-4">
                      {order.checkoutType === 'WHATSAPP' ? (
                        <span className="inline-flex items-center text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full text-[10px]">
                          <MessageSquare size={12} className="mr-1" /> WhatsApp
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-blue-800 font-bold bg-blue-100 border border-blue-300 px-2.5 py-1 rounded-full text-[10px]">
                          <CreditCard size={12} className="mr-1" /> Web Transfer
                        </span>
                      )}
                    </td>

                    <td
                      className={`p-4 font-extrabold text-sm ${
                        isLight ? 'text-[#B45309]' : 'text-white'
                      }`}
                    >
                      {formatPrice(order.totalAmount)}
                    </td>

                    {/* Bukti Transfer Image Viewer */}
                    <td className="p-4">
                      {order.paymentProofUrl ? (
                        <button
                          onClick={() => setSelectedProof(order.paymentProofUrl || null)}
                          className={`px-3 py-1.5 rounded-lg font-bold border flex items-center space-x-1.5 transition-all shadow-sm ${
                            isLight
                              ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A] hover:bg-[#FDE68A]'
                              : 'bg-[#140E0A] text-[#FACC15] border-[#FACC15]/30 hover:bg-[#FACC15] hover:text-[#140E0A]'
                          }`}
                        >
                          <Eye size={14} />
                          <span>View Transfer Proof</span>
                        </button>
                      ) : (
                        <span className={`italic text-[11px] ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                          Not Yet Uploaded
                        </span>
                      )}
                    </td>

                    <td className="p-4">{getStatusBadge(order.status)}</td>

                    {/* Distinct Action Buttons */}
                    <td className="p-4 text-right space-x-1 space-y-1">
                      <button
                        onClick={() => setSelectedOrderDetails(order)}
                        className={`px-2.5 py-1.5 rounded-lg font-semibold text-[11px] border ${
                          isLight
                            ? 'bg-[#FAF8F5] text-[#2C1D11] border-[#D6CBB8] hover:bg-gray-200'
                            : 'bg-[#2E2016] text-white hover:bg-white/20'
                        }`}
                      >
                        Detail
                      </button>

                      {order.status !== 'PAID' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PAID')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-[11px] shadow transition-all"
                        >
                          Approve Payment
                        </button>
                      )}

                      {order.status === 'PAID' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-lg text-[11px] shadow transition-all"
                        >
                          Ship Order
                        </button>
                      )}

                      {order.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'REJECTED')}
                          className="px-2.5 py-1.5 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-lg font-bold text-[11px] transition-colors border border-red-300"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Preview Foto Bukti Transfer */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto font-sans">
          <div
            className={`rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-auto border ${
              isLight ? 'bg-white border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#231911] border-[#FACC15]/30 text-white'
            }`}
          >
            <div className="flex justify-between items-center border-b border-black/10 pb-3">
              <h3 className="text-lg font-extrabold text-[#D97706]">Transfer Proof Photo</h3>
              <button
                onClick={() => setSelectedProof(null)}
                className={isLight ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'}
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black border border-black/10 flex items-center justify-center min-h-[250px]">
              <img
                src={selectedProof}
                alt="Bukti Transfer Pelanggan"
                className="max-h-[65vh] w-full object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-gray-500 font-normal truncate max-w-xs">{selectedProof}</span>
              <button
                onClick={() => setSelectedProof(null)}
                className="px-5 py-2 bg-[#D97706] text-white font-extrabold rounded-xl text-xs uppercase hover:bg-[#B45309]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: View Full Order Details */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto font-sans">
          <div
            className={`rounded-2xl max-w-2xl w-full shadow-2xl my-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col border ${
              isLight ? 'bg-white border-[#D6CBB8] text-[#2C1D11]' : 'bg-[#231911] border-[#FACC15]/30 text-white'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`flex justify-between items-center p-6 border-b sticky top-0 z-10 rounded-t-2xl ${
                isLight ? 'bg-[#FAF8F5] border-[#E6DEC9]' : 'bg-[#231911] border-white/10'
              }`}
            >
              <div>
                <span className="text-[10px] text-[#D97706] font-bold uppercase tracking-wider">ORDER DETAILS</span>
                <h3 className={`text-xl font-extrabold ${isLight ? 'text-[#2C1D11]' : 'text-white'}`}>
                  #{selectedOrderDetails.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className={isLight ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs p-4 rounded-xl border ${
                  isLight ? 'bg-[#FAF8F5] border-[#E6DEC9]' : 'bg-[#140E0A] border-white/10'
                }`}
              >
                <div>
                  <p className="text-gray-500 font-normal">Customer:</p>
                  <p className="font-bold text-sm">{selectedOrderDetails.customerName}</p>
                  <p className="font-normal">Phone: {selectedOrderDetails.customerPhone}</p>
                  <p className="font-normal">Email: {selectedOrderDetails.customerEmail}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-normal">Shipping Address:</p>
                  <p className="font-normal">{selectedOrderDetails.address}</p>
                  <p className="font-normal">{selectedOrderDetails.city}, {selectedOrderDetails.postalCode}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#D97706] mb-2">Ordered Products:</h4>
                <div
                  className={`divide-y rounded-xl p-4 space-y-2 border ${
                    isLight ? 'bg-[#FAF8F5] divide-[#E6DEC9] border-[#E6DEC9]' : 'bg-[#140E0A] divide-white/10 border-white/10'
                  }`}
                >
                  {selectedOrderDetails.items.map((it) => (
                    <div key={it.id} className="pt-2 flex justify-between text-xs items-center">
                      <span className="font-semibold">{it.productName} ({it.quantity}x)</span>
                      <span className="font-bold text-[#D97706]">{formatPrice(it.price * it.quantity)}</span>
                    </div>
                  ))}
                  {selectedOrderDetails.shippingMethod && (
                    <div className="pt-2 flex justify-between text-xs items-center">
                      <span className="font-semibold">Shipping ({selectedOrderDetails.shippingMethod})</span>
                      <span className="font-bold text-[#D97706]">
                        {formatPrice(selectedOrderDetails.shippingCost ?? 0)}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 flex justify-between font-bold text-sm text-[#D97706] border-t border-gray-300">
                    <span>Total Bill:</span>
                    <span className="text-base">{formatPrice(selectedOrderDetails.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {selectedOrderDetails.paymentProofUrl && (
                <div>
                  <h4 className="text-sm font-bold text-[#D97706] mb-2">Transfer Proof Photo:</h4>
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-black/10 bg-black max-h-56">
                    <img
                      src={selectedOrderDetails.paymentProofUrl}
                      alt="Struk Bukti Bayar"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div
              className={`p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3 rounded-b-2xl ${
                isLight ? 'bg-[#FAF8F5] border-[#E6DEC9]' : 'bg-[#231911] border-white/10'
              }`}
            >
              <span className="text-xs text-gray-500">Status: {getStatusBadge(selectedOrderDetails.status)}</span>
              
              <div className="flex space-x-2">
                {selectedOrderDetails.status !== 'PAID' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrderDetails.id, 'PAID')}
                    className="px-4 py-2 bg-emerald-600 text-white font-extrabold rounded-xl text-xs uppercase hover:bg-emerald-500 shadow"
                  >
                    Approve Payment
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-5 py-2 bg-[#D97706] text-white font-extrabold rounded-xl text-xs uppercase hover:bg-[#B45309]"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
