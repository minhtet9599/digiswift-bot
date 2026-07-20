import React, { useState } from "react";
import { motion } from "motion/react";
import { Settings, ShieldCheck, HelpCircle, Copy, AlertCircle, Trash2, Key, Info, RefreshCw, Radio } from "lucide-react";
import { BotSettings } from "../types.js";

interface BotSettingsViewProps {
  settings: BotSettings;
  appUrl: string;
  onSaveSettings: (settings: Partial<BotSettings>) => Promise<void>;
  onSetupWebhook: (token?: string) => Promise<void>;
  onDeleteWebhook: () => Promise<void>;
}

export default function BotSettingsView({ settings, appUrl, onSaveSettings, onSetupWebhook, onDeleteWebhook }: BotSettingsViewProps) {
  const [tokenInput, setTokenInput] = useState(settings.token || "");
  const [welcomeInput, setWelcomeInput] = useState(settings.welcomeMessage || "");
  const [supportInput, setSupportInput] = useState(settings.supportLink || "");
  const [paymentSimulate, setPaymentSimulate] = useState(settings.paymentSimulateOnly);

  const [isSaving, setIsSaving] = useState(false);
  const [isWebhooking, setIsWebhooking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSaveSettings({
      token: tokenInput,
      welcomeMessage: welcomeInput,
      supportLink: supportInput,
      paymentSimulateOnly: paymentSimulate,
    });
    setIsSaving(false);
  };

  const triggerSetupWebhook = async () => {
    if (!tokenInput.trim()) {
      alert("Please provide a valid Telegram Bot Token first!");
      return;
    }
    setIsWebhooking(true);
    await onSetupWebhook(tokenInput);
    setIsWebhooking(false);
  };

  const triggerDeleteWebhook = async () => {
    setIsDeleting(true);
    await onDeleteWebhook();
    setIsDeleting(false);
  };

  const copyWebhookUrl = () => {
    const fullUrl = `${appUrl}/api/telegram/webhook`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div id="bot_settings_panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Settings Form Column */}
      <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-xs p-5 space-y-6">
        <div className="flex items-center gap-1.5">
          <Settings className="w-5 h-5 text-indigo-500 animate-spin" style={{ animationDuration: "12s" }} />
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 font-sans">Telegram Bot Configuration</h2>
            <p className="text-xs text-gray-500">Connect a live Telegram Bot or customize bot profile information.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Bot Token input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
                🔑 Telegram Bot API Token
              </label>
              <span className="text-[10px] text-gray-400">Get this from @BotFather</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                className="w-full text-xs px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Welcome Message */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">💬 Bot Welcome /start Message</label>
            <textarea
              rows={5}
              value={welcomeInput}
              onChange={(e) => setWelcomeInput(e.target.value)}
              placeholder="The starting text players see when hitting /start"
              className="w-full text-xs px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-sans leading-relaxed"
            />
            <p className="text-[10px] text-gray-400">Supports standard Telegram Markdown (e.g. **bold**, _italic_).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Support Link */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">📞 Support Contact Link</label>
              <input
                type="text"
                value={supportInput}
                onChange={(e) => setSupportInput(e.target.value)}
                placeholder="https://t.me/your_telegram_username"
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>

            {/* Payment simulation */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">💰 Payment Checkout Simulation</label>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPaymentSimulate(true)}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-bold border transition ${
                    paymentSimulate
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Simulate Payments (Instant)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentSimulate(false)}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-bold border transition ${
                    !paymentSimulate
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Require Real Gateway
                </button>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-3 border-t border-gray-100 mt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Integration Guide Column */}
      <div className="space-y-4">
        {/* Webhook Control Panel */}
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-indigo-500" /> Webhook Controller
          </h3>

          <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Webhook Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                settings.isWebhookSet 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                  : "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
              }`}>
                {settings.isWebhookSet ? "● Linked Live" : "● No Webhook Registered"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-gray-500 block">Active Webhook URL:</span>
              <div className="flex items-center gap-1 mt-1">
                <code className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded truncate block flex-1 font-mono">
                  {appUrl ? `${appUrl}/api/telegram/webhook` : "Evaluating..."}
                </code>
                <button
                  onClick={copyWebhookUrl}
                  title="Copy webhook"
                  className="p-1 border border-gray-200 hover:bg-slate-100 rounded-md transition text-gray-500"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {copiedUrl && <span className="text-[9px] text-emerald-600 block text-right font-medium">Copied!</span>}
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={triggerSetupWebhook}
              disabled={isWebhooking || !tokenInput}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
            >
              {isWebhooking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Set Telegram Webhook
            </button>

            {settings.isWebhookSet && (
              <button
                onClick={triggerDeleteWebhook}
                disabled={isDeleting}
                className="w-full py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Live Webhook
              </button>
            )}
          </div>
        </div>

        {/* Setup Bot guide */}
        <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-xs space-y-3.5 text-xs text-gray-600">
          <h3 className="font-semibold text-gray-900 flex items-center gap-1">
            <HelpCircle className="w-4 h-4 text-indigo-500" /> How to get Telegram Token?
          </h3>
          <ul className="space-y-2 list-decimal list-inside pl-1 text-[11px] leading-relaxed">
            <li>
              Open Telegram and search for the official account <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">@BotFather</a>.
            </li>
            <li>
              Send command <code className="bg-slate-100 text-slate-700 px-1 rounded">/newbot</code> and reply with a name for your shop bot.
            </li>
            <li>
              Choose a unique username ending in <code className="bg-slate-100 text-slate-700 px-1 rounded">_bot</code> (e.g. <code className="text-gray-700">DigitalCoinShop_bot</code>).
            </li>
            <li>
              @BotFather will give you a long **API Token**. Paste that token in the field on the left.
            </li>
            <li>
              Click <strong>Save Configuration</strong>, then click <strong>Set Telegram Webhook</strong>. Now your bot is fully live on Telegram!
            </li>
          </ul>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] text-indigo-700 flex gap-2 items-start leading-relaxed">
            <Info className="w-4 h-4 shrink-0 text-indigo-500" />
            <p>
              <strong>Note:</strong> You can use our in-app interactive simulator on the right to test and demonstrate all shopping features instantly, even if you do not have a real Telegram bot registered!
            </p>
          </div>
        </div>

        {/* Public Webhook Troubleshooter */}
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl shadow-xs space-y-3.5 text-xs text-amber-900">
          <h3 className="font-bold text-amber-950 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" /> No Response in Public? (Fixes)
          </h3>
          <div className="space-y-2 text-[11px] leading-relaxed">
            <p>
              If your real Telegram bot is not responding when you send messages in the Telegram app, check these 2 main settings:
            </p>
            <ol className="list-decimal list-inside pl-1 space-y-2 font-medium">
              <li>
                <span className="text-amber-950">You MUST use the "Shared App" URL:</span>
                <span className="block text-amber-800 font-normal pl-4 mt-0.5">
                  The private preview URL (starting with <code className="bg-amber-100/80 px-1 rounded font-mono text-[10px]">ais-dev-</code>) is password-protected by AI Studio. Telegram servers are blocked from reaching it! Click the <strong>Share</strong> button in the top menu and open the <strong>Shared App URL</strong> (starting with <code className="bg-amber-100/80 px-1 rounded font-mono text-[10px]">ais-pre-</code>). Enter your token and click <strong>Set Telegram Webhook</strong> there.
                </span>
              </li>
              <li>
                <span className="text-amber-950">Confirm webhook linking success:</span>
                <span className="block text-amber-800 font-normal pl-4 mt-0.5">
                  Ensure the Webhook Status says <code className="bg-emerald-100 text-emerald-800 px-1 rounded font-bold text-[10px]">● Linked Live</code>. If you get a connection error, verify that you didn't include extra spaces in your Bot Token.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
