import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, ShieldCheck, Clock, XCircle, RotateCcw, AlertCircle, Calendar, Hash, CreditCard, ExternalLink } from "lucide-react";
import { Order, CategoryType } from "../types.js";

interface OrdersListProps {
  orders: Order[];
  onRefundOrder: (id: string) => Promise<void>;
}

export default function OrdersList({ orders, onRefundOrder }: OrdersListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [refundingId, setRefundingId] = useState<string | null>(null);

  // Filter orders based on conditions
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || o.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleRefund = async (id: string) => {
    if (confirm(`Are you sure you want to refund order #${id}? The delivered key will be recycled back into stock.`)) {
      setRefundingId(id);
      await onRefundOrder(id);
      setRefundingId(null);
    }
  };

  const statusBadges: Record<string, { label: string; bg: string; text: string; icon: any }> = {
    paid: { label: "Completed", bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", icon: ShieldCheck },
    pending: { label: "Pending", bg: "bg-amber-50 border-amber-100", text: "text-amber-700", icon: Clock },
    failed: { label: "Cancelled", bg: "bg-gray-100 border-gray-200", text: "text-gray-500", icon: XCircle },
    refunded: { label: "Refunded", bg: "bg-rose-50 border-rose-100", text: "text-rose-700", icon: RotateCcw }
  };

  const categoryBadges: Record<CategoryType, string> = {
    subscription: "bg-emerald-50 text-emerald-700 border-emerald-100",
    coin: "bg-indigo-50 text-indigo-700 border-indigo-100",
    vpn: "bg-sky-50 text-sky-700 border-sky-100",
    key: "bg-amber-50 text-amber-700 border-amber-100"
  };

  const methodIcons: Record<string, string> = {
    card: "💳 Card",
    crypto: "🪙 Crypto",
    telegram: "📱 BotPay"
  };

  return (
    <div id="orders_panel" className="bg-white border border-gray-100 rounded-xl shadow-xs p-5 space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 font-sans">Sales Log & Deliveries</h2>
        <p className="text-xs text-gray-500">Track automatic deliveries, invoice states, and trigger manual refunds.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID, customer username, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 bg-gray-50">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-transparent focus:outline-hidden border-none py-1.5 pl-0.5 text-gray-700 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Completed</option>
              <option value="pending">Pending Payments</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Cancelled</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 bg-gray-50">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-transparent focus:outline-hidden border-none py-1.5 text-gray-700 font-medium"
            >
              <option value="all">All Categories</option>
              <option value="subscription">📺 Subscriptions</option>
              <option value="coin">🔫 Game Coins</option>
              <option value="vpn">🛡️ VPN Profiles</option>
              <option value="key">🎮 Digital Keys</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto border border-gray-100 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
              <th className="py-3 px-4">Invoice ID</th>
              <th className="py-3 px-4">Customer Info</th>
              <th className="py-3 px-4">Purchased Product</th>
              <th className="py-3 px-4">Price / Gateway</th>
              <th className="py-3 px-4">Delivered License Key</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400 space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="font-semibold text-gray-500 text-xs">No orders found</p>
                  <p className="text-[10px] max-w-xs mx-auto">
                    Try adjusting your keyword searches or category filters, or complete a simulated payment in the Telegram mockup!
                  </p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const BadgeIcon = statusBadges[o.status].icon;
                const isRefundable = o.status === "paid";

                return (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition">
                    {/* ID & Date */}
                    <td className="py-4 px-4 space-y-1">
                      <div className="font-bold text-slate-800 font-mono flex items-center gap-1">
                        <Hash className="w-3 h-3 text-slate-400" />
                        {o.id}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      {o.telegramUserId ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            @{o.customerName}
                          </span>
                          <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-sm font-semibold">
                            Bot Client
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="font-medium text-slate-800">{o.customerName}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-semibold">
                            Web Checkout
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Product */}
                    <td className="py-4 px-4 space-y-1 max-w-[200px]">
                      <div className="font-semibold text-slate-900 truncate" title={o.productName}>
                        {o.productName}
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${categoryBadges[o.category]}`}>
                        {o.category}
                      </span>
                    </td>

                    {/* Price & Gateway */}
                    <td className="py-4 px-4 font-mono space-y-1">
                      <div className="font-bold text-slate-950">${o.price.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <CreditCard className="w-3 h-3" />
                        {methodIcons[o.paymentMethod] || o.paymentMethod}
                      </div>
                    </td>

                    {/* Key delivered */}
                    <td className="py-4 px-4 max-w-[150px]">
                      {o.deliveredKey ? (
                        <div className="flex items-center gap-1">
                          <code className="text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono border border-slate-200 select-all truncate block max-w-full">
                            {o.deliveredKey}
                          </code>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">Pending delivery</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4">
                      <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1.5 w-fit ${statusBadges[o.status].bg} ${statusBadges[o.status].text}`}>
                        <BadgeIcon className="w-3 h-3" />
                        {statusBadges[o.status].label}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      {isRefundable ? (
                        <button
                          id={`btn_refund_${o.id}`}
                          onClick={() => handleRefund(o.id)}
                          disabled={refundingId === o.id}
                          className="px-2 py-1 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-md text-[10px] font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className={`w-3 h-3 ${refundingId === o.id ? "animate-spin" : ""}`} />
                          {refundingId === o.id ? "Refunding..." : "Refund"}
                        </button>
                      ) : (
                        <span className="text-gray-300 text-[10px] font-medium">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
