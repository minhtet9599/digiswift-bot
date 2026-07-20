import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, Settings, ShoppingBag, Database, ShieldAlert,
  BarChart3, RefreshCw, ShoppingCart, Key, Terminal, ExternalLink, Menu, X
} from "lucide-react";
import { Product, Order, BotSettings, ChatMessage, AnalyticsSummary } from "./types";

// Import custom sub-components
import Analytics from "./components/Analytics";
import ProductManager from "./components/ProductManager";
import OrdersList from "./components/OrdersList";
import BotSettingsView from "./components/BotSettingsView";
import BotSimulator from "./components/BotSimulator";
import WebStorefront from "./components/WebStorefront";

export default function App() {
  // Navigation states
  const [activePane, setActivePane] = useState<"admin" | "retail">("admin");
  const [adminTab, setAdminTab] = useState<"overview" | "products" | "orders" | "bot">("overview");

  // Core synchronized server states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // App URL for webhook setting
  const [appUrl, setAppUrl] = useState<string>("");

  // Loading & error trackers
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Mobile menu/drawer toggles
  const [isBotOverlayOpen, setIsBotOverlayOpen] = useState(false);

  // Initialize and load server state
  useEffect(() => {
    // Read window origin as fallback for APP_URL
    setAppUrl(window.location.origin);
    syncServerState(true);
  }, []);

  // Fetch full dataset from Express backend
  const syncServerState = async (initial = false) => {
    if (initial) setIsLoading(true);
    else setIsSyncing(true);

    try {
      const [pRes, oRes, sRes, aRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/settings"),
        fetch("/api/analytics")
      ]);

      if (!pRes.ok || !oRes.ok || !sRes.ok || !aRes.ok) {
        throw new Error("Failed to synchronize database records from local server.");
      }

      const pData = await pRes.json();
      const oData = await oRes.json();
      const sData = await sRes.json();
      const aData = await aRes.json();

      setProducts(pData);
      setOrders(oData);
      setSettings(sData);
      setAnalytics(aData);
      setErrorText(null);
    } catch (err: any) {
      console.error("Backend sync failed:", err);
      setErrorText("Database synchronization offline. Check if your development server is booting.");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  // Product mutations
  const handleSaveProduct = async (pData: Partial<Product>) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pData),
      });
      if (!response.ok) throw new Error("Could not preserve product data.");
      await syncServerState();
    } catch (err: any) {
      alert(`Product action failed: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete requested product.");
      await syncServerState();
    } catch (err: any) {
      alert(`Product deletion failed: ${err.message}`);
    }
  };

  const handleAddKeys = async (productId: string, rawKeys: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: rawKeys }),
      });
      if (!response.ok) throw new Error("Refill keys processing failed.");
      await syncServerState();
    } catch (err: any) {
      alert(`Key loading failed: ${err.message}`);
    }
  };

  // Orders mutations
  const handleRefundOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/refund/${id}`, { method: "POST" });
      if (!response.ok) throw new Error("Fulfillment refund action failed on gateway.");
      await syncServerState();
    } catch (err: any) {
      alert(`Refund failed: ${err.message}`);
    }
  };

  // Bot configuration mutations
  const handleSaveSettings = async (sData: Partial<BotSettings>) => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sData),
      });
      if (!response.ok) throw new Error("Could not save bot configurations.");
      await syncServerState();
    } catch (err: any) {
      alert(`Settings update failed: ${err.message}`);
    }
  };

  const handleSetupWebhook = async (token?: string) => {
    try {
      const response = await fetch("/api/settings/setup-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, appUrl })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Webhook link failed on Telegram API Node.");
      await syncServerState();
    } catch (err: any) {
      alert(`Telegram Webhook failed: ${err.message}`);
    }
  };

  const handleDeleteWebhook = async () => {
    try {
      const response = await fetch("/api/settings/delete-webhook", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Webhook removal failed on Telegram API Node.");
      await syncServerState();
    } catch (err: any) {
      alert(`Webhook deletion failed: ${err.message}`);
    }
  };

  // Client Web Storefront Checkout
  const handleWebCheckout = async (productId: string, customerName: string, method: "card" | "crypto"): Promise<Order> => {
    const response = await fetch("/api/web/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, customerName, paymentMethod: method })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Web Checkout transaction failed.");
    }
    const data = await response.json();
    await syncServerState(); // Sync dashboard records in background
    return data.order;
  };

  // Bot Simulator communication routes
  const handleSimulatorMessage = async (text: string): Promise<ChatMessage[]> => {
    const response = await fetch("/api/simulator/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: "58219381", username: "sandbox_tester", text })
    });
    if (!response.ok) return [];
    const data = await response.json();
    syncServerState(); // Sync catalog numbers (sales/keys count) after user bot order
    return data.messages || [];
  };

  const handleSimulatorCallback = async (callbackData: string): Promise<ChatMessage[]> => {
    const response = await fetch("/api/simulator/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: "58219381", username: "sandbox_tester", callbackData })
    });
    if (!response.ok) return [];
    const data = await response.json();
    syncServerState(); // Sync catalog numbers after fulfillment
    return data.messages || [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 animate-pulse">
          <Bot className="w-8 h-8 animate-bounce" />
          <span className="font-extrabold tracking-tight text-xl font-sans text-slate-800">Bot Store Center Loading</span>
        </div>
        <p className="text-xs text-gray-500 font-medium">Booting full-stack environment and importing schemas...</p>
      </div>
    );
  }

  if (errorText) {
    return (
      <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="p-3 bg-rose-100 rounded-full text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="text-center space-y-1">
          <h1 className="font-black text-rose-950 text-lg">Server Error Connected</h1>
          <p className="text-xs text-rose-700 max-w-sm leading-relaxed">{errorText}</p>
        </div>
        <button
          onClick={() => syncServerState(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col select-none">
      {/* Visual Navigation Header */}
      <header className="bg-white border-b border-gray-150 py-3.5 px-6 shrink-0 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between shadow-xs z-30">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm font-black">
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-slate-950 text-base leading-none">Telegram Bot Store Manager</h1>
            <p className="text-[10px] text-gray-500 font-medium mt-1">Subscriptions, Coins, VPN & Digital Delivery Keys Panel</p>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1 bg-slate-100/70 p-1 border border-gray-200/50 rounded-xl shrink-0 self-start sm:self-center">
          <button
            onClick={() => setActivePane("admin")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activePane === "admin"
                ? "bg-white text-gray-900 border border-gray-200 shadow-xs"
                : "text-gray-500 hover:text-gray-950"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Admin Control Center
          </button>
          <button
            onClick={() => setActivePane("retail")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activePane === "retail"
                ? "bg-white text-gray-900 border border-gray-200 shadow-xs"
                : "text-gray-500 hover:text-gray-950"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Web Retail Storefront
          </button>
        </div>

        {/* Utilities */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            onClick={() => syncServerState()}
            disabled={isSyncing}
            className="p-2 border border-gray-200 hover:bg-slate-50 text-gray-600 disabled:opacity-50 hover:text-gray-900 rounded-xl transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync State"}
          </button>
          
          <button
            onClick={() => setIsBotOverlayOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            Open Bot Simulator
          </button>
        </div>
      </header>

      {/* Main Dual Frame Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Active Management Panel or Store View */}
        <main className="flex-1 p-6 overflow-y-auto min-w-0 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* If pane is ADMIN, render admin sub-tabs */}
            {activePane === "admin" && (
              <div className="space-y-6">
                {/* Admin Sub-navigation buttons */}
                <div className="border-b border-gray-200 flex gap-1 overflow-x-auto select-none no-scrollbar">
                  {[
                    { id: "overview", label: "📊 Overview", icon: BarChart3 },
                    { id: "products", label: "📦 Product Inventory", icon: Key },
                    { id: "orders", label: "📝 Sales & Delivery Log", icon: ShoppingCart },
                    { id: "bot", label: "⚙️ Bot Setup", icon: Bot }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id as any)}
                      className={`px-4 py-2 border-b-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        adminTab === tab.id
                          ? "border-indigo-600 text-indigo-600 font-extrabold"
                          : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Sub Tab views router */}
                <div>
                  {adminTab === "overview" && analytics && (
                    <Analytics summary={analytics} />
                  )}

                  {adminTab === "products" && (
                    <ProductManager 
                      products={products}
                      onSaveProduct={handleSaveProduct}
                      onDeleteProduct={handleDeleteProduct}
                      onAddKeys={handleAddKeys}
                    />
                  )}

                  {adminTab === "orders" && (
                    <OrdersList 
                      orders={orders}
                      onRefundOrder={handleRefundOrder}
                    />
                  )}

                  {adminTab === "bot" && settings && (
                    <BotSettingsView 
                      settings={settings}
                      appUrl={appUrl}
                      onSaveSettings={handleSaveSettings}
                      onSetupWebhook={handleSetupWebhook}
                      onDeleteWebhook={handleDeleteWebhook}
                    />
                  )}
                </div>
              </div>
            )}

            {/* If pane is RETAIL, render direct Web Storefront */}
            {activePane === "retail" && (
              <WebStorefront 
                products={products}
                onWebCheckout={handleWebCheckout}
              />
            )}

          </div>
        </main>

        {/* Right Side: Persistent Interactive Telegram Bot Simulator (Desktop only) */}
        <aside className="hidden lg:block w-[400px] border-l border-gray-200 bg-white p-5 shrink-0 h-full overflow-hidden">
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-1 mb-3 shrink-0">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-500" /> Interactive Bot Simulator
              </h3>
              <p className="text-[11px] text-gray-400">
                A live Telegram client sandbox. Orders placed here pop database keys and fulfill real-time on your logs!
              </p>
            </div>
            <div className="flex-1 min-h-0">
              <BotSimulator 
                onSendMessage={handleSimulatorMessage}
                onSendCallback={handleSimulatorCallback}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Floating Webhook alert bar if token is missing and on Admin bot tab */}
      {activePane === "admin" && adminTab === "bot" && settings && !settings.token && (
        <div className="bg-amber-500 text-white text-xs py-2 px-6 flex justify-between items-center shrink-0">
          <span className="font-semibold flex items-center gap-2">
            <span className="bg-amber-600 rounded px-1.5 py-0.5 font-bold">Pro Tip</span>
            You are running in Simulator Mode. Add a Telegram Bot Token to route sales to real Telegram chats!
          </span>
          <button 
            onClick={() => setAdminTab("bot")}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-amber-700 font-bold rounded text-[10px] transition"
          >
            Configure Token
          </button>
        </div>
      )}

      {/* Mobile Bot Simulator overlay drawer */}
      <AnimatePresence>
        {isBotOverlayOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="bg-white w-full max-w-md h-full shadow-2xl p-4 flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-gray-150 pb-3 mb-4 shrink-0">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1">
                    <Bot className="w-4 h-4 text-indigo-500" /> Telegram Client Sandbox
                  </h3>
                  <p className="text-[10px] text-gray-400">Interactive live bot mockup sandbox</p>
                </div>
                <button
                  onClick={() => setIsBotOverlayOpen(false)}
                  className="p-1.5 border border-gray-150 rounded-full hover:bg-slate-50 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 min-h-0">
                <BotSimulator 
                  onSendMessage={handleSimulatorMessage}
                  onSendCallback={handleSimulatorCallback}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
