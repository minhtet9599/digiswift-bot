import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, CreditCard, AlertTriangle, Check, ShieldCheck, Copy, Info, Tag, Layers } from "lucide-react";
import { Product, Order, CategoryType } from "../types.js";

interface WebStorefrontProps {
  products: Product[];
  onWebCheckout: (productId: string, customerName: string, method: "card" | "crypto") => Promise<Order>;
}

export default function WebStorefront({ products, onWebCheckout }: WebStorefrontProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState("Web Shopper");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Card Inputs simulation
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");

  const categories: { key: string; label: string; icon: string }[] = [
    { key: "all", label: "All Products", icon: "🌐" },
    { key: "subscription", label: "Subscriptions", icon: "📺" },
    { key: "coin", label: "Game Coins", icon: "🔫" },
    { key: "vpn", label: "VPN Access", icon: "🛡️" },
    { key: "key", label: "Digital Keys", icon: "🎮" }
  ];

  const filteredProducts = activeTab === "all" 
    ? products 
    : products.filter(p => p.category === activeTab);

  const handleStartCheckout = (p: Product) => {
    if (p.keys.length === 0) return;
    setSelectedProduct(p);
    setCompletedOrder(null);
  };

  const handleCompleteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || isProcessing) return;

    setIsProcessing(true);
    try {
      const order = await onWebCheckout(selectedProduct.id, customerName, paymentMethod);
      setCompletedOrder(order);
    } catch (err) {
      console.error("Web Checkout failed", err);
      alert("Checkout failed. Out of stock or internal error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1500);
  };

  const closeModals = () => {
    setSelectedProduct(null);
    setCompletedOrder(null);
  };

  return (
    <div id="webstorefront_panel" className="space-y-6">
      {/* Header and banner */}
      <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-xs">
        {/* Decorative ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400 font-mono">Retail Web Showcase</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-sans">Digital Goods Instant Delivery</h2>
          <p className="text-xs text-slate-300 max-w-lg">
            This storefront mirrors the exact product pools and keys managed by your Telegram bot. Purchase here to test automated key pops and immediate order fulfillment!
          </p>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 select-none no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === cat.key
                ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-950"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid List of Store Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((p) => {
          const inStock = p.keys.length > 0;

          return (
            <div 
              key={p.id} 
              id={`store_prod_${p.id}`}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                {/* Badge and image header */}
                <div className="flex justify-between items-center">
                  <span className="text-3xl">{p.image}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold capitalize ${
                    inStock 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : "bg-rose-50 text-rose-700 border-rose-100"
                  }`}>
                    {inStock ? `In Stock (${p.keys.length})` : "Out of Stock"}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{p.name}</h3>
                  <p className="text-[11px] text-gray-400 font-mono uppercase tracking-wider">{p.category}</p>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3 min-h-[3.3em]">
                  {p.description || "Premium digital delivery access item."}
                </p>
              </div>

              {/* Price and buy action footer */}
              <div className="bg-slate-50/70 border-t border-gray-100/60 p-4 flex justify-between items-center mt-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">Retail Price</span>
                  <strong className="text-base font-bold text-gray-900 font-mono">${p.price.toFixed(2)}</strong>
                </div>

                <button
                  onClick={() => handleStartCheckout(p)}
                  disabled={!inStock}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer ${
                    inStock 
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                      : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Buy Instantly
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden"
            >
              {/* If purchase is not finished yet, show form */}
              {!completedOrder ? (
                <div>
                  <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-indigo-500" /> Secure Checkout Portal
                    </h3>
                    <button
                      onClick={closeModals}
                      className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600 transition font-bold"
                    >
                      Close
                    </button>
                  </div>

                  <form onSubmit={handleCompleteCheckout} className="p-5 space-y-4">
                    {/* Item card brief */}
                    <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg flex justify-between items-center text-xs">
                      <div className="flex gap-2 items-center">
                        <span className="text-2xl">{selectedProduct.image}</span>
                        <div>
                          <p className="font-bold text-slate-900">{selectedProduct.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">Immediate Delivery Pool</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-950 font-mono">${selectedProduct.price.toFixed(2)}</span>
                    </div>

                    {/* Customer details */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-700">Billing Customer Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                      />
                    </div>

                    {/* Payment methods */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-700">Choose Gateway</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("card")}
                          className={`py-2 text-center rounded-lg text-xs font-bold border transition ${
                            paymentMethod === "card"
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          💳 Credit Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("crypto")}
                          className={`py-2 text-center rounded-lg text-xs font-bold border transition ${
                            paymentMethod === "crypto"
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          🪙 BTC / USDT
                        </button>
                      </div>
                    </div>

                    {/* Gateway specific card inputs */}
                    {paymentMethod === "card" ? (
                      <div className="p-3.5 bg-slate-50 border border-gray-150 rounded-lg space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] uppercase font-bold text-gray-400 font-mono">Card Number</label>
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-md font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] uppercase font-bold text-gray-400 font-mono">Expiration</label>
                            <input
                              type="text"
                              required
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-md font-mono text-center"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] uppercase font-bold text-gray-400 font-mono">CVC Code</label>
                            <input
                              type="text"
                              required
                              maxLength={3}
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-md font-mono text-center"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-slate-50 border border-gray-150 rounded-lg space-y-2 text-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">Mock Crypto Invoice Address</span>
                        <code className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded truncate block font-mono select-all">
                          bc1qlp9shv8vstwt6a38v77r6wsz2t
                        </code>
                        <p className="text-[9px] text-gray-400">Copy the above wallet code and hit checkout to confirm mock transfer.</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {isProcessing ? "Processing gateway transaction..." : `Authorize Payment ($${selectedProduct.price.toFixed(2)})`}
                    </button>
                  </form>
                </div>
              ) : (
                /* Checkout Successful, pop key */
                <div className="p-6 text-center space-y-5">
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-gray-900 text-base">Payment Verified Successfully!</h3>
                    <p className="text-xs text-gray-500">Your order has been captured on Invoice ID <strong>#{completedOrder.id}</strong></p>
                  </div>

                  {/* Delivered License Key box */}
                  <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2 select-all">
                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-indigo-400 block">Delivered Activation Key</span>
                    <code className="text-sm font-mono font-black text-white select-all block break-all bg-slate-950 px-3 py-2 border border-slate-800 rounded-md">
                      {completedOrder.deliveredKey}
                    </code>
                    <button
                      onClick={() => handleCopyKey(completedOrder.deliveredKey || "")}
                      className="px-2.5 py-1 border border-slate-700 hover:bg-slate-800 rounded-md text-[10px] font-bold transition flex items-center gap-1 mx-auto text-slate-300 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedKey ? "Copied!" : "Copy Code"}
                    </button>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg text-[11px] text-gray-500 flex gap-2 text-left leading-relaxed">
                    <Info className="w-4 h-4 shrink-0 text-slate-400" />
                    <p>
                      This activation key has been successfully retrieved and popped from the product inventory database. You can verify this transaction under the <strong>Sales Log</strong> tab on the Admin panel.
                    </p>
                  </div>

                  <button
                    onClick={closeModals}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
                  >
                    Done & Return to Store
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
