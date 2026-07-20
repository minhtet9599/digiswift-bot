import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, RefreshCw, Smartphone, Shield, Circle, ArrowLeft, Bot, User, Check, Copy } from "lucide-react";
import { ChatMessage, InlineButton } from "../types.js";

interface BotSimulatorProps {
  onSendMessage: (text: string) => Promise<ChatMessage[]>;
  onSendCallback: (data: string) => Promise<ChatMessage[]>;
}

export default function BotSimulator({ onSendMessage, onSendCallback }: BotSimulatorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial_welcome_client",
      sender: "bot",
      text: "👋 **Welcome to Digital Delivery Bot Simulator!**\n\nThis simulator interacts directly with our unified backend Bot Engine.\n\nClick the `/start` action below or type a message to start shopping premium digital items!",
      timestamp: new Date().toISOString(),
      buttons: [
        [
          { text: "🚀 Start Bot (/start)", callbackData: "menu_main" }
        ]
      ]
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatUser, setChatUser] = useState("tg_shopper_99");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle User Message submit
  const handleSendMessageSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setIsSending(true);

    // Append user message immediately
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const replies = await onSendMessage(textToSend);
      if (replies && replies.length > 0) {
        setMessages((prev) => [...prev, ...replies]);
      }
    } catch (err) {
      console.error("Error sending simulator message", err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle callback button click
  const handleCallbackClick = async (btn: InlineButton) => {
    if (isSending) return;
    setIsSending(true);

    // Append user feedback bubble indicating click
    const userFeedback: ChatMessage = {
      id: `user_click_${Date.now()}`,
      sender: "user",
      text: `[Tapped: ${btn.text}]`,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userFeedback]);

    try {
      const replies = await onSendCallback(btn.callbackData);
      if (replies && replies.length > 0) {
        setMessages((prev) => [...prev, ...replies]);
      }
    } catch (err) {
      console.error("Error executing callback query", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: "bot",
        text: "👋 **Welcome back!** Chat session restarted. Choose an action below:",
        timestamp: new Date().toISOString(),
        buttons: [
          [
            { text: "🛍 Browse Products", callbackData: "menu_catalog" },
            { text: "👤 My Profile", callbackData: "menu_profile" }
          ],
          [
            { text: "🔑 My Purchased Keys", callbackData: "menu_keys" },
            { text: "📞 Contact Support", callbackData: "menu_support" }
          ]
        ]
      }
    ]);
  };

  // Format bot markdown text (bold, italic, code segments)
  const formatMarkdown = (text: string) => {
    if (!text) return "";

    // Break lines
    const lines = text.split("\n");

    return lines.map((line, lIdx) => {
      // Parse horizontal rules
      if (line.trim() === "━━━━━━━━━━━━━━━━━━━━" || line.trim().startsWith("━━━━")) {
        return <hr key={lIdx} className="border-gray-200/60 my-2" />;
      }

      // Regex replace to match **bold**, _italic_, `inline code`
      const parts = [];
      let currentString = line;

      // Simple regex replacement representation
      // We will segment the text by inline code, bold, italic
      const tokenRegex = /(\*\*.*?\*\*|_.*?_|`.*?`)/g;
      const subSegments = line.split(tokenRegex);

      const lineContent = subSegments.map((seg, sIdx) => {
        if (seg.startsWith("**") && seg.endsWith("**")) {
          return <strong key={sIdx} className="font-bold text-gray-900">{seg.slice(2, -2)}</strong>;
        }
        if (seg.startsWith("_") && seg.endsWith("_")) {
          return <em key={sIdx} className="italic text-gray-700">{seg.slice(1, -1)}</em>;
        }
        if (seg.startsWith("`") && seg.endsWith("`")) {
          const rawCode = seg.slice(1, -1);
          return (
            <code
              key={sIdx}
              onClick={() => {
                navigator.clipboard.writeText(rawCode);
                setCopiedKey(rawCode);
                setTimeout(() => setCopiedKey(null), 1500);
              }}
              title="Click to copy code"
              className="px-1.5 py-0.5 bg-sky-50 text-indigo-700 rounded font-mono text-[10px] border border-sky-100 cursor-pointer hover:bg-sky-100 select-all transition"
            >
              {rawCode}
            </code>
          );
        }
        return seg;
      });

      return (
        <p key={lIdx} className="min-h-[1.2em] leading-relaxed break-words text-[12px] text-gray-800">
          {lineContent}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 border border-gray-200 rounded-2xl overflow-hidden shadow-xs relative">
      {/* Top Header Mockup */}
      <div className="bg-slate-900 text-white px-4 py-3 shrink-0 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold flex items-center gap-1.5">
              Digital Delivery Bot
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
            </h4>
            <span className="text-[10px] text-indigo-200">@DigitalDeliveryBot • bot</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset chat */}
          <button
            onClick={handleResetChat}
            title="Restart chat session"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <div className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold uppercase tracking-wider rounded font-mono">
            Sandbox
          </div>
        </div>
      </div>

      {/* Simulator Username Setting */}
      <div className="bg-slate-800 text-slate-300 px-4 py-1.5 text-[10px] font-mono flex justify-between items-center shrink-0">
        <span>Active User Context:</span>
        <div className="flex items-center gap-1">
          <User className="w-3 h-3 text-indigo-400" />
          <input
            type="text"
            value={chatUser}
            onChange={(e) => setChatUser(e.target.value.replace(/\s+/g, "_"))}
            title="Edit Telegram handle"
            className="bg-transparent text-white font-bold border-none underline outline-hidden w-24 text-right focus:text-indigo-300"
          />
        </div>
      </div>

      {/* Chat Messages Panel */}
      <div 
        id="simulator_chat_area"
        className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 relative"
        style={{ backgroundImage: "radial-gradient(#e2e8f0 1.2px, transparent 1.2px)", backgroundSize: "16px 16px" }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-2 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Avatar Icon */}
                <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] ${
                  isBot ? "bg-indigo-600 text-white" : "bg-slate-700 text-white"
                }`}>
                  {isBot ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                </div>

                <div className="space-y-1.5 w-full">
                  {/* Bubble body */}
                  <div className={`px-3.5 py-2.5 rounded-2xl shadow-xs text-xs space-y-1.5 border leading-relaxed ${
                    isBot 
                      ? "bg-white text-gray-800 border-gray-100 rounded-tl-none" 
                      : "bg-indigo-600 text-white border-indigo-700 rounded-tr-none"
                  }`}>
                    {/* Render Text */}
                    <div className="space-y-1">
                      {isBot ? formatMarkdown(msg.text) : <p className="text-[12px]">{msg.text}</p>}
                    </div>

                    {/* Timestamp / status */}
                    <div className="flex justify-end items-center gap-0.5 text-[9px] text-gray-400 font-mono mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {!isBot && <Check className="w-3 h-3 text-indigo-200" />}
                    </div>
                  </div>

                  {/* Render inline buttons */}
                  {isBot && msg.buttons && msg.buttons.length > 0 && (
                    <div className="grid gap-1.5 mt-2 w-full">
                      {msg.buttons.map((row, rIdx) => (
                        <div key={rIdx} className="flex gap-1.5 w-full">
                          {row.map((btn, bIdx) => (
                            <button
                              key={bIdx}
                              onClick={() => handleCallbackClick(btn)}
                              disabled={isSending}
                              className="flex-1 text-center py-2 px-2.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 disabled:opacity-50 text-slate-800 font-semibold border border-slate-300 rounded-xl text-[11px] transition duration-150 truncate cursor-pointer shadow-xs"
                            >
                              {btn.text}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isSending && (
          <div className="flex gap-2 items-center text-xs text-gray-400 italic font-mono pl-8 animate-pulse">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
            </span>
            Bot is typing...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestion tags */}
      <div className="px-3 py-1.5 bg-slate-50 border-t border-gray-200 flex gap-1.5 overflow-x-auto shrink-0 select-none no-scrollbar">
        {[
          { text: "🛍 Catalog", action: "/catalog" },
          { text: "🔑 My Keys", action: "/mykeys" },
          { text: "👤 Profile", action: "/start profile" },
          { text: "📞 Support", action: "/help support" }
        ].map((tag) => (
          <button
            key={tag.text}
            onClick={() => {
              setInputText(tag.action);
              handleSendMessageSubmit();
            }}
            className="px-2 py-1 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40 rounded-full text-[10px] font-bold text-gray-600 hover:text-indigo-600 transition shrink-0 cursor-pointer"
          >
            {tag.text}
          </button>
        ))}
      </div>

      {/* Bottom Message Input Bar */}
      <form 
        onSubmit={handleSendMessageSubmit} 
        className="p-3 bg-white border-t border-gray-200 shrink-0 flex gap-2 items-center"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message, e.g. /start..."
          className="flex-1 text-xs px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200/60 focus:bg-white border border-transparent focus:border-indigo-400 rounded-xl focus:outline-hidden transition"
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center transition shrink-0 shadow-xs cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Copy feedback notification */}
      <AnimatePresence>
        {copiedKey && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1.5 z-50 border border-slate-800"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Copied code: <code className="font-mono text-emerald-200 bg-slate-800/80 px-1 rounded">{copiedKey}</code>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
