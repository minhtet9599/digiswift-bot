import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Key, Edit, Box, AlertCircle, ShoppingBag, X, RefreshCw } from "lucide-react";
import { Product, CategoryType } from "../types.js";

interface ProductManagerProps {
  products: Product[];
  onSaveProduct: (p: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onAddKeys: (productId: string, keys: string) => Promise<void>;
}

export default function ProductManager({ products, onSaveProduct, onDeleteProduct, onAddKeys }: ProductManagerProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // New stock keys text input state
  const [newKeysText, setNewKeysText] = useState("");
  const [isSubmittingKeys, setIsSubmittingKeys] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState<CategoryType>("subscription");
  const [formImage, setFormImage] = useState("📦");
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const openAddForm = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormCategory("subscription");
    setFormImage("📺");
    setIsFormOpen(true);
  };

  const openEditForm = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDescription(p.description);
    setFormPrice(p.price.toString());
    setFormCategory(p.category);
    setFormImage(p.image);
    setIsFormOpen(true);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) return;

    setIsSavingProduct(true);
    const productData: Partial<Product> = {
      id: editingProduct?.id,
      name: formName,
      description: formDescription,
      price: parseFloat(formPrice),
      category: formCategory,
      image: formImage,
    };

    await onSaveProduct(productData);
    setIsSavingProduct(false);
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const handleAddKeysSubmit = async (productId: string) => {
    if (!newKeysText.trim()) return;
    setIsSubmittingKeys(true);
    await onAddKeys(productId, newKeysText);
    setNewKeysText("");
    setIsSubmittingKeys(false);

    // Refresh selected product context
    const updated = products.find(p => p.id === productId);
    if (updated) {
      setSelectedProduct(updated);
    }
  };

  const categoryBadges: Record<CategoryType, { label: string; color: string }> = {
    subscription: { label: "Subscription", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    coin: { label: "Game Coins", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    vpn: { label: "VPN Access", color: "bg-sky-50 text-sky-700 border-sky-100" },
    key: { label: "Digital Key", color: "bg-amber-50 text-amber-700 border-amber-100" }
  };

  return (
    <div id="product_manager" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product List Panel */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 font-sans">Product Inventory</h2>
            <p className="text-xs text-gray-500">Add, edit, or refill stock codes for automated delivery.</p>
          </div>
          <button
            id="btn_add_product"
            onClick={openAddForm}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>

        {/* List Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => {
            const hasStock = p.keys.length > 0;
            const isSelected = selectedProduct?.id === p.id;

            return (
              <motion.div
                key={p.id}
                layoutId={`prod_card_${p.id}`}
                onClick={() => setSelectedProduct(p)}
                className={`p-4 bg-white rounded-xl border cursor-pointer transition flex flex-col justify-between h-44 hover:shadow-md ${
                  isSelected ? "border-indigo-500 shadow-md ring-2 ring-indigo-50" : "border-gray-100 shadow-xs"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-2xl" id={`prod_emoji_${p.id}`}>{p.image}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${categoryBadges[p.category].color}`}>
                      {categoryBadges[p.category].label}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-sm mt-3 leading-tight line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                    {p.description || "No description provided."}
                  </p>
                </div>

                <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-mono">Price</span>
                    <strong className="text-sm font-bold text-gray-950 font-mono">${p.price.toFixed(2)}</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-mono">Keys in Stock</span>
                    <span className={`text-xs font-semibold flex items-center justify-end gap-1 ${hasStock ? "text-emerald-600" : "text-rose-500"}`}>
                      {!hasStock && <AlertCircle className="w-3 h-3 text-rose-500" />}
                      {p.keys.length} keys
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Key Refill and Action Center */}
      <div className="space-y-4">
        {selectedProduct ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-100 p-5 rounded-xl shadow-xs space-y-5 sticky top-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-2 items-center">
                <span className="text-2xl">{selectedProduct.image}</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{selectedProduct.name}</h3>
                  <span className="text-[10px] font-mono text-gray-400">ID: {selectedProduct.id}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  id="btn_edit_product"
                  onClick={() => openEditForm(selectedProduct)}
                  title="Edit Info"
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  id="btn_delete_product"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete ${selectedProduct.name}?`)) {
                      await onDeleteProduct(selectedProduct.id);
                      setSelectedProduct(null);
                    }
                  }}
                  title="Delete Product"
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Current Stock:</span>
                <span className="font-bold font-mono text-gray-900">{selectedProduct.keys.length} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Completed Sales:</span>
                <span className="font-bold font-mono text-gray-900">{selectedProduct.soldCount} delivered</span>
              </div>
            </div>

            {/* Keys Listing Box */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-700 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-indigo-500" /> Stock Keys pool:
                </span>
                <span className="text-[10px] text-gray-400">Next to deliver on top</span>
              </div>

              {selectedProduct.keys.length === 0 ? (
                <div className="p-4 border border-dashed border-gray-200 text-center rounded-lg space-y-1 text-gray-400">
                  <AlertCircle className="w-5 h-5 mx-auto text-rose-400" />
                  <p className="text-xs font-medium text-rose-500">Out of Stock!</p>
                  <p className="text-[10px]">The bot cannot sell this item until you add keys below.</p>
                </div>
              ) : (
                <div className="border border-gray-100 rounded-lg max-h-24 overflow-y-auto font-mono text-[11px] p-2 bg-gray-50 space-y-1 divide-y divide-gray-100">
                  {selectedProduct.keys.map((k, index) => (
                    <div key={index} className="pt-1 first:pt-0 flex justify-between gap-1 text-gray-700 truncate select-all">
                      <span className="truncate">{k}</span>
                      {index === 0 && <span className="text-[9px] font-sans font-bold bg-emerald-100 text-emerald-800 px-1 rounded-sm flex items-center">NEXT</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Refill Keys Panel */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-700">⚡️ Refill Keys / Codes (Paste bulk):</label>
              <textarea
                rows={3}
                value={newKeysText}
                onChange={(e) => setNewKeysText(e.target.value)}
                placeholder="Paste keys here, one code per line:&#10;KEY-AAAA-BBBB&#10;KEY-CCCC-DDDD&#10;URL-OR-CONFIG-DATA"
                className="w-full text-xs font-mono p-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 resize-none"
              />
              <button
                id="btn_refill_keys"
                disabled={isSubmittingKeys || !newKeysText.trim()}
                onClick={() => handleAddKeysSubmit(selectedProduct.id)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                {isSubmittingKeys ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add stock keys ({newKeysText.split("\n").filter(Boolean).length} codes)
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 p-8 rounded-xl text-center text-gray-400 space-y-2 flex flex-col justify-center items-center h-[340px]">
            <Box className="w-8 h-8 text-gray-300 animate-pulse" />
            <p className="text-xs font-semibold text-gray-500 mt-2">Manage Stock & Keys</p>
            <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed">
              Click on any product card to view active codes in the pool, delete the product, or refill digital keys.
            </p>
          </div>
        )}
      </div>

      {/* Slide-over Drawer / Modal for Add & Edit Product */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-gray-900 text-sm">
                  {editingProduct ? `✏️ Edit Product details` : `🛍 Create New Product`}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProductSubmit} className="p-5 space-y-4">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Netflix Premium 1 Month"
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Detailed Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide description, specs, account information, or features."
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">Category *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as CategoryType)}
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white"
                    >
                      <option value="subscription">📺 Subscription</option>
                      <option value="coin">🔫 Game Coins</option>
                      <option value="vpn">🛡️ VPN Profile</option>
                      <option value="key">🎮 Digital Key</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">Price (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-mono">$</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="9.99"
                        className="w-full text-xs pl-6 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Icon Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700">Display Icon (Emoji)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="📦"
                      className="w-12 text-center text-lg py-1.5 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                    />
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {["📺", "🎵", "🎥", "🛡️", "🦈", "🌐", "🎮", "💻", "🔑", "🔫", "🧱", "💎"].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormImage(emoji)}
                          className={`w-7 h-7 text-sm flex items-center justify-center rounded-lg hover:bg-gray-100 transition ${
                            formImage === emoji ? "bg-indigo-50 border border-indigo-200 ring-1 ring-indigo-200" : ""
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-3 border-t border-gray-100 mt-5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    {isSavingProduct ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
