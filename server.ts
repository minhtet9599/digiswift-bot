import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import { Product, Order, BotSettings, ChatMessage, CategoryType, AnalyticsSummary } from "./src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to load/save JSON database
function loadDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    // Seed with initial high-quality products, settings, and mock orders
    const initialProducts: Product[] = [
      {
        id: "sub_netflix_1m",
        name: "Netflix Premium 1 Month (UltraHD 4K)",
        description: "Official premium private subscription. Enjoy 4K HDR streams on up to 4 screens simultaneously.",
        price: 12.99,
        category: "subscription",
        image: "📺",
        keys: ["NF-PREM-4K-9281-WJQD", "NF-PREM-4K-4731-PLAM", "NF-PREM-4K-1029-KJMS"],
        soldCount: 14,
      },
      {
        id: "sub_spotify_3m",
        name: "Spotify Premium 3 Months (Individual)",
        description: "Ad-free music listening, offline playback, and unlimited skips. Redeemed via custom link.",
        price: 9.99,
        category: "subscription",
        image: "🎵",
        keys: ["SPOT-3M-9281-HDKS", "SPOT-3M-2731-XHDW", "SPOT-3M-4829-ZNMS"],
        soldCount: 28,
      },
      {
        id: "sub_youtube_1y",
        name: "YouTube Premium 1 Year (Individual)",
        description: "YouTube and YouTube Music ad-free, offline, and in the background. Private account upgrade.",
        price: 29.99,
        category: "subscription",
        image: "🎥",
        keys: ["YT-1Y-2918-WKDS-QWPL"],
        soldCount: 8,
      },
      {
        id: "coin_pubg_660",
        name: "PUBG Mobile 660 UC (Global)",
        description: "PlayerUnknown's Battlegrounds Mobile Unknown Cash. Instant digital pin activation.",
        price: 9.99,
        category: "coin",
        image: "🔫",
        keys: ["PUBG-UC660-8273-1928", "PUBG-UC660-3847-2910"],
        soldCount: 42,
      },
      {
        id: "coin_roblox_800",
        name: "Roblox 800 Robux",
        description: "Buy upgrades for your avatar or special abilities in experiences. Digital code.",
        price: 9.99,
        category: "coin",
        image: "🧱",
        keys: ["ROBUX-800-AHSK-2918", "ROBUX-800-MXZN-4829", "ROBUX-800-QWIE-1029"],
        soldCount: 55,
      },
      {
        id: "coin_ff_530",
        name: "Free Fire 530 Diamonds",
        description: "Garena Free Fire diamonds. Purchase weapons, pets, skins, and items in Store.",
        price: 4.99,
        category: "coin",
        image: "💎",
        keys: ["FF-DM-530-9182-3847-PLOS"],
        soldCount: 19,
      },
      {
        id: "vpn_nord_1y",
        name: "NordVPN Premium 1 Year (1 Device)",
        description: "Secure, high-speed VPN tunnel. military-grade encryption, double VPN option, 5500+ servers.",
        price: 47.88,
        category: "vpn",
        image: "🛡️",
        keys: ["NORD-1Y-MZXN-9182-AHSK", "NORD-1Y-QLWP-2839-ZNMX"],
        soldCount: 22,
      },
      {
        id: "vpn_surf_1y",
        name: "Surfshark VPN 1 Year (Unlimited)",
        description: "CleanWeb adblocker, unlimited concurrent devices, bypasser split-tunneling, high performance.",
        price: 35.88,
        category: "vpn",
        image: "🦈",
        keys: ["SURF-1Y-PQWO-1029-ASDF"],
        soldCount: 11,
      },
      {
        id: "key_steam_20",
        name: "Steam $20 USD Gift Card (Global)",
        description: "Adds $20.00 to your Steam Wallet funds. Valid for all games, software, and hardware.",
        price: 20.00,
        category: "key",
        image: "🎮",
        keys: ["STEAM-USD20-8271-9283", "STEAM-USD20-1029-4829"],
        soldCount: 31,
      },
      {
        id: "key_win11_pro",
        name: "Windows 11 Pro Retail Key (OEM)",
        description: "Lifetime retail license activation for Windows 11 Pro 32/64-bit. Official Microsoft support.",
        price: 14.99,
        category: "key",
        image: "💻",
        keys: ["W11P-OEM-8172-2910-4829", "W11P-OEM-1928-3847-2910"],
        soldCount: 64,
      }
    ];

    const initialSettings: BotSettings = {
      token: "",
      webhookUrl: "",
      welcomeMessage: "👋 Welcome to **Digital Delivery Bot**!\n\nWe provide instant delivery on premium digital goods with automated payments.\n\n⚡️ Subscriptions (Netflix, Spotify...)\n⚡️ Game Currencies (PUBG, Robux...)\n⚡️ High-Speed VPN Licenses\n⚡️ Digital Wallet & OS Keys\n\nChoose an action below to start browsing our live inventory! 👇",
      supportLink: "https://t.me/your_support_channel",
      paymentSimulateOnly: true,
      isWebhookSet: false,
    };

    // Generate 10 realistic past orders for analytics
    const initialOrders: Order[] = [
      {
        id: "ORD-92817",
        productId: "sub_netflix_1m",
        productName: "Netflix Premium 1 Month (UltraHD 4K)",
        category: "subscription",
        price: 12.99,
        status: "paid",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: "tg_gamer_pro",
        telegramUserId: "58219381",
        deliveredKey: "NF-PREM-4K-SOLD-1982",
        paymentMethod: "card"
      },
      {
        id: "ORD-92818",
        productId: "coin_roblox_800",
        productName: "Roblox 800 Robux",
        category: "coin",
        price: 9.99,
        status: "paid",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: "Web Customer #11",
        telegramUserId: null,
        deliveredKey: "ROBUX-800-SOLD-8271",
        paymentMethod: "crypto"
      },
      {
        id: "ORD-92819",
        productId: "vpn_nord_1y",
        productName: "NordVPN Premium 1 Year (1 Device)",
        category: "vpn",
        price: 47.88,
        status: "paid",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: "vpn_enjoyer",
        telegramUserId: "29381029",
        deliveredKey: "NORD-1Y-SOLD-8812",
        paymentMethod: "card"
      },
      {
        id: "ORD-92820",
        productId: "key_win11_pro",
        productName: "Windows 11 Pro Retail Key (OEM)",
        category: "key",
        price: 14.99,
        status: "paid",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: "office_worker_99",
        telegramUserId: "81729182",
        deliveredKey: "W11P-OEM-SOLD-7712",
        paymentMethod: "card"
      },
      {
        id: "ORD-92821",
        productId: "sub_spotify_3m",
        productName: "Spotify Premium 3 Months (Individual)",
        category: "subscription",
        price: 9.99,
        status: "paid",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: "music_fanatic",
        telegramUserId: "10293847",
        deliveredKey: "SPOT-3M-SOLD-1123",
        paymentMethod: "telegram"
      },
      {
        id: "ORD-92822",
        productId: "coin_pubg_660",
        productName: "PUBG Mobile 660 UC (Global)",
        category: "coin",
        price: 9.99,
        status: "paid",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: "pubg_sniper",
        telegramUserId: "93810293",
        deliveredKey: "PUBG-UC660-SOLD-1981",
        paymentMethod: "crypto"
      },
      {
        id: "ORD-92823",
        productId: "key_steam_20",
        productName: "Steam $20 USD Gift Card (Global)",
        category: "key",
        price: 20.00,
        status: "paid",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        customerName: "steam_collector",
        telegramUserId: "28391029",
        deliveredKey: "STEAM-USD20-SOLD-1092",
        paymentMethod: "card"
      },
      {
        id: "ORD-92824",
        productId: "sub_netflix_1m",
        productName: "Netflix Premium 1 Month (UltraHD 4K)",
        category: "subscription",
        price: 12.99,
        status: "paid",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        customerName: "movie_critic",
        telegramUserId: "48291029",
        deliveredKey: "NF-PREM-4K-SOLD-2201",
        paymentMethod: "telegram"
      },
      {
        id: "ORD-92825",
        productId: "coin_roblox_800",
        productName: "Roblox 800 Robux",
        category: "coin",
        price: 9.99,
        status: "pending",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        customerName: "roblox_kid",
        telegramUserId: "92831029",
        deliveredKey: null,
        paymentMethod: "crypto"
      }
    ];

    const db = {
      products: initialProducts,
      orders: initialOrders,
      settings: initialSettings,
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    return db;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading database file, returning fresh default", e);
    return { products: [], orders: [], settings: {} };
  }
}

function saveDatabase(db: { products: Product[]; orders: Order[]; settings: BotSettings }) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("Error writing database file", e);
  }
}

// Initialize database
let db = loadDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API - Get Products
  app.get("/api/products", (req, res) => {
    db = loadDatabase();
    res.json(db.products);
  });

  // API - Add/Update Product
  app.post("/api/products", (req, res) => {
    const data = req.body;
    db = loadDatabase();

    if (!data.name || !data.category || data.price === undefined) {
      return res.status(400).json({ error: "Missing required product fields (name, category, price)" });
    }

    const index = db.products.findIndex(p => p.id === data.id);
    if (index >= 0) {
      db.products[index] = { ...db.products[index], ...data };
    } else {
      const newProduct: Product = {
        id: data.id || `prod_${Date.now()}`,
        name: data.name,
        description: data.description || "",
        price: Number(data.price),
        category: data.category,
        image: data.image || "📦",
        keys: data.keys || [],
        soldCount: 0,
      };
      db.products.push(newProduct);
    }

    saveDatabase(db);
    res.json({ success: true, products: db.products });
  });

  // API - Delete Product
  app.delete("/api/products/:id", (req, res) => {
    const { id } = req.params;
    db = loadDatabase();
    db.products = db.products.filter(p => p.id !== id);
    saveDatabase(db);
    res.json({ success: true, products: db.products });
  });

  // API - Add keys to product
  app.post("/api/products/:id/keys", (req, res) => {
    const { id } = req.params;
    const { keys } = req.body; // Array of strings or single string with newlines
    db = loadDatabase();

    const product = db.products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let parsedKeys: string[] = [];
    if (Array.isArray(keys)) {
      parsedKeys = keys;
    } else if (typeof keys === "string") {
      parsedKeys = keys.split("\n").map(k => k.trim()).filter(Boolean);
    }

    product.keys = [...product.keys, ...parsedKeys];
    saveDatabase(db);
    res.json({ success: true, product });
  });

  // API - Get Orders
  app.get("/api/orders", (req, res) => {
    db = loadDatabase();
    res.json(db.orders);
  });

  // API - Refund Order
  app.post("/api/orders/refund/:id", (req, res) => {
    const { id } = req.params;
    db = loadDatabase();

    const order = db.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status === "refunded") {
      return res.status(400).json({ error: "Order is already refunded" });
    }

    order.status = "refunded";

    // If there was a delivered key, we put it back in product keys (optional, lets put it back to stock!)
    if (order.deliveredKey) {
      const product = db.products.find(p => p.id === order.productId);
      if (product) {
        product.keys.push(order.deliveredKey);
        product.soldCount = Math.max(0, product.soldCount - 1);
      }
    }

    saveDatabase(db);
    res.json({ success: true, orders: db.orders, products: db.products });
  });

  // API - Get Settings
  app.get("/api/settings", (req, res) => {
    db = loadDatabase();
    res.json(db.settings);
  });

  // API - Update Settings
  app.post("/api/settings", (req, res) => {
    const data = req.body;
    db = loadDatabase();
    db.settings = { ...db.settings, ...data };
    saveDatabase(db);
    res.json({ success: true, settings: db.settings });
  });

  // API - Setup Telegram Webhook URL
  app.post("/api/settings/setup-webhook", async (req, res) => {
    db = loadDatabase();
    const token = db.settings.token || req.body.token;
    if (!token) {
      return res.status(400).json({ error: "Telegram Bot Token is required to set up webhook." });
    }

    // Determine current App URL. If APP_URL is injected in env, use it. Otherwise, we can use the origin from the request.
    const appUrl = process.env.APP_URL || req.body.appUrl || "";
    if (!appUrl) {
      return res.status(400).json({ error: "Could not determine App URL. Please set it or pass it." });
    }

    const webhookUrl = `${appUrl}/api/telegram/webhook`;

    try {
      console.log(`Setting up Telegram Webhook with bot token: ${token.substring(0, 6)}... on URL: ${webhookUrl}`);
      const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
      const data = await response.json();

      if (data.ok) {
        db.settings.isWebhookSet = true;
        db.settings.webhookUrl = webhookUrl;
        if (req.body.token) {
          db.settings.token = req.body.token;
        }
        saveDatabase(db);
        return res.json({ success: true, status: "Webhook set successfully!", data });
      } else {
        return res.status(400).json({ error: "Telegram API failed to set webhook", data });
      }
    } catch (err: any) {
      return res.status(500).json({ error: `Connection to Telegram API failed: ${err.message}` });
    }
  });

  // API - Delete Webhook URL
  app.post("/api/settings/delete-webhook", async (req, res) => {
    db = loadDatabase();
    const token = db.settings.token;
    if (!token) {
      return res.status(400).json({ error: "No Telegram Bot Token configured." });
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
      const data = await response.json();

      if (data.ok) {
        db.settings.isWebhookSet = false;
        db.settings.webhookUrl = "";
        saveDatabase(db);
        return res.json({ success: true, status: "Webhook deleted successfully!", data });
      } else {
        return res.status(400).json({ error: "Telegram API failed to delete webhook", data });
      }
    } catch (err: any) {
      return res.status(500).json({ error: `Connection to Telegram API failed: ${err.message}` });
    }
  });

  // Helper to convert internal simple markdown formats securely to Telegram-compliant HTML.
  // This avoids all Markdown parsing failures when strings contain unescaped underscores, asterisks, brackets, or other symbols.
  function markdownToHtml(text: string): string {
    if (!text) return "";
    // 1. Safe escape of HTML characters to prevent breaking Telegram XML parsers
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 2. Bold tags: replace **bold** with <b>bold</b>
    html = html.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    // 3. Italic tags: replace _italic_ with <i>italic</i>
    html = html.replace(/_(.*?)_/g, "<i>$1</i>");

    // 4. Code tags: replace `code` with <code>code</code>
    html = html.replace(/`(.*?)`/g, "<code>$1</code>");

    return html;
  }

  // -----------------------------------------------------------------
  // BOT CORE SYSTEM ENGINE
  // Handles commands & button callback queries from both real webhook and local web simulator!
  // -----------------------------------------------------------------
  async function sendBotMessage(
    chatId: string | number,
    text: string,
    replyMarkupButtons?: { text: string; callbackData: string }[][],
    isSimulated = false,
    collector?: ChatMessage[]
  ) {
    // 1. If it's a simulated flow, we collect it into an array that will be returned to the simulator client
    if (isSimulated && collector) {
      const inlineButtons = replyMarkupButtons ? replyMarkupButtons.map(row => 
        row.map(btn => ({ text: btn.text, callbackData: btn.callbackData }))
      ) : undefined;

      collector.push({
        id: `bot_msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        sender: "bot",
        text,
        timestamp: new Date().toISOString(),
        buttons: inlineButtons
      });
      return;
    }

    // 2. If it is a REAL Telegram bot update, we fire an HTTP request to Telegram API if token is configured
    db = loadDatabase();
    const token = db.settings.token;
    if (!token) {
      console.log(`[Bot Engine - Simulated Send] Chat ID: ${chatId}. Message: ${text.substring(0, 40)}... (No token configured)`);
      return;
    }

    const inlineKeyboard = replyMarkupButtons ? replyMarkupButtons.map(row =>
      row.map(btn => ({ text: btn.text, callback_data: btn.callbackData }))
    ) : undefined;

    const formattedText = markdownToHtml(text);

    const payload: any = {
      chat_id: chatId,
      text: formattedText,
      parse_mode: "HTML",
    };

    if (inlineKeyboard) {
      payload.reply_markup = { inline_keyboard: inlineKeyboard };
    }

    try {
      console.log(`[Telegram API sendBotMessage] Dispatching to Chat ID: ${chatId}. Mode: HTML`);
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("[Telegram API sendBotMessage Response]", JSON.stringify(data));
    } catch (err) {
      console.error("Error pushing real Telegram message", err);
    }
  }

  // Telegram webhook update logic
  async function processBotEngineUpdate(
    update: any,
    isSimulated = false,
    collector?: ChatMessage[]
  ) {
    db = loadDatabase();
    const welcomeText = db.settings.welcomeMessage;
    const supportLink = db.settings.supportLink;

    // A. Parse Telegram structures
    let chatId: string | number = 0;
    let username = "customer";
    let textInput = "";
    let callbackData = "";
    let callbackQueryId = "";
    let isCallback = false;

    if (update.message) {
      chatId = update.message.chat.id;
      username = update.message.chat.username || update.message.chat.first_name || `user_${chatId}`;
      textInput = update.message.text || "";
    } else if (update.callback_query) {
      isCallback = true;
      callbackQueryId = update.callback_query.id;
      chatId = update.callback_query.message.chat.id;
      username = update.callback_query.from.username || update.callback_query.from.first_name || `user_${chatId}`;
      callbackData = update.callback_query.data;
      textInput = "";
    } else {
      // Unknown Telegram update structure
      return;
    }

    const homeButtons = [
      [
        { text: "🛍 Browse Products", callbackData: "menu_catalog" },
        { text: "👤 My Profile", callbackData: "menu_profile" }
      ],
      [
        { text: "🔑 My Purchased Keys", callbackData: "menu_keys" },
        { text: "📞 Contact Support", callbackData: "menu_support" }
      ]
    ];

    // B. Main Route handling
    if (!isCallback) {
      const text = textInput.trim();

      // Start command
      if (text.startsWith("/start")) {
        await sendBotMessage(chatId, welcomeText, homeButtons, isSimulated, collector);
      } else if (text.startsWith("/help") || text.startsWith("/catalog")) {
        await sendBotMessage(
          chatId,
          "📂 **Product Catalog**\nSelect a category below to browse premium items currently in stock:",
          [
            [{ text: "📺 Subscriptions", callbackData: "cat_subscription" }, { text: "🔫 Game Coins", callbackData: "cat_coin" }],
            [{ text: "🛡️ VPN Profiles", callbackData: "cat_vpn" }, { text: "🎮 Wallet & OS Keys", callbackData: "cat_key" }],
            [{ text: "⬅️ Back to Home", callbackData: "menu_main" }]
          ],
          isSimulated,
          collector
        );
      } else if (text.startsWith("/mykeys")) {
        // Query user's purchased keys
        const userOrders = db.orders.filter(o => o.telegramUserId === String(chatId) && o.status === "paid");
        if (userOrders.length === 0) {
          await sendBotMessage(
            chatId,
            "❌ **No keys found!**\n\nYou haven't purchased any items yet or your payments are pending.",
            homeButtons,
            isSimulated,
            collector
          );
        } else {
          let reply = "🔑 **Your Active Licenses / Keys:**\n\n";
          userOrders.forEach((o, i) => {
            reply += `${i + 1}. **${o.productName}**\n   ` +
                     `🔑 Code: \`${o.deliveredKey}\`\n   ` +
                     `📅 Bought: _${new Date(o.createdAt).toLocaleDateString()}_\n\n`;
          });
          await sendBotMessage(chatId, reply, homeButtons, isSimulated, collector);
        }
      } else {
        // Default message
        await sendBotMessage(
          chatId,
          "❓ **Command not recognized.**\n\nPlease use `/start` to access the main menu or tap any of the options below.",
          homeButtons,
          isSimulated,
          collector
        );
      }
    } else {
      // C. Callback Buttons Router
      console.log(`[Bot Callback] User ${username} triggered button: ${callbackData}`);

      if (callbackData === "menu_main") {
        await sendBotMessage(chatId, welcomeText, homeButtons, isSimulated, collector);
      } else if (callbackData === "menu_catalog") {
        await sendBotMessage(
          chatId,
          "📂 **Product Catalog**\nSelect a category below to browse premium items currently in stock:",
          [
            [{ text: "📺 Subscriptions", callbackData: "cat_subscription" }, { text: "🔫 Game Coins", callbackData: "cat_coin" }],
            [{ text: "🛡️ VPN Profiles", callbackData: "cat_vpn" }, { text: "🎮 Wallet & OS Keys", callbackData: "cat_key" }],
            [{ text: "⬅️ Back to Home", callbackData: "menu_main" }]
          ],
          isSimulated,
          collector
        );
      } else if (callbackData === "menu_support") {
        await sendBotMessage(
          chatId,
          `📞 **Need Assistance?**\n\nIf you have issues with your purchase, key activation, or want custom bulk pricing, feel free to contact our support agent:\n\n💬 Support Handle: ${supportLink}\n\n🕒 **Available:** 24/7/365 with typical response within 15 minutes.`,
          [[{ text: "⬅️ Main Menu", callbackData: "menu_main" }]],
          isSimulated,
          collector
        );
      } else if (callbackData === "menu_profile") {
        // Find purchases count and active keys
        const userOrders = db.orders.filter(o => o.telegramUserId === String(chatId));
        const paidOrders = userOrders.filter(o => o.status === "paid");
        const spend = paidOrders.reduce((sum, o) => sum + o.price, 0);

        const profileText = `👤 **Telegram User Profile:**\n\n` +
          `• **Username:** @${username}\n` +
          `• **User ID:** \`${chatId}\`\n` +
          `• **Total Orders:** ${userOrders.length}\n` +
          `• **Paid Purchases:** ${paidOrders.length}\n` +
          `• **Total Invested:** $${spend.toFixed(2)}\n\n` +
          `🎁 **Referral Program:** Share your unique referral link to earn 5% cashback on friend orders:\n` +
          `https://t.me/DigitalDeliveryBot?start=ref_${chatId}`;

        await sendBotMessage(
          chatId,
          profileText,
          [[{ text: "🔑 My Keys", callbackData: "menu_keys" }, { text: "⬅️ Main Menu", callbackData: "menu_main" }]],
          isSimulated,
          collector
        );
      } else if (callbackData === "menu_keys") {
        const userOrders = db.orders.filter(o => o.telegramUserId === String(chatId) && o.status === "paid");
        if (userOrders.length === 0) {
          await sendBotMessage(
            chatId,
            "❌ **No keys found!**\n\nYou haven't purchased any items yet. Shop now using the Catalog!",
            [[{ text: "🛍 Browse Catalog", callbackData: "menu_catalog" }, { text: "⬅️ Main Menu", callbackData: "menu_main" }]],
            isSimulated,
            collector
          );
        } else {
          let reply = "🔑 **Your Active Licenses / Keys:**\n\n";
          userOrders.forEach((o, i) => {
            reply += `📦 **${o.productName}**\n` +
                     `   🔑 Key: \`${o.deliveredKey}\`\n` +
                     `   📅 Date: _${new Date(o.createdAt).toLocaleDateString()}_\n\n`;
          });
          await sendBotMessage(
            chatId,
            reply,
            [[{ text: "🛍 Browse Catalog", callbackData: "menu_catalog" }, { text: "⬅️ Main Menu", callbackData: "menu_main" }]],
            isSimulated,
            collector
          );
        }
      } else if (callbackData.startsWith("cat_")) {
        // Select category
        const catName = callbackData.replace("cat_", "") as CategoryType;
        const productsInCat = db.products.filter(p => p.category === catName);

        const categoryTitles: Record<CategoryType, string> = {
          subscription: "📺 Subscriptions Inventory",
          coin: "🔫 Game Currencies Stock",
          vpn: "🛡️ VPN Configuration Profiles",
          key: "🎮 Gift Cards & License Keys"
        };

        if (productsInCat.length === 0) {
          await sendBotMessage(
            chatId,
            `📦 **${categoryTitles[catName]}**\n\nSorry, this category currently has no items listed in our inventory. Please check back later!`,
            [[{ text: "⬅️ Back to Catalog", callbackData: "menu_catalog" }]],
            isSimulated,
            collector
          );
        } else {
          let reply = `📦 **${categoryTitles[catName]}**\n\nSelect a product to view details, current stock levels, and proceed to checkout:`;
          const buttons = productsInCat.map(p => ([{
            text: `${p.image} ${p.name} — $${p.price.toFixed(2)} (${p.keys.length > 0 ? `In Stock: ${p.keys.length}` : 'Out of Stock'})`,
            callbackData: `prod_${p.id}`
          }]));
          buttons.push([{ text: "⬅️ Back to Catalog", callbackData: "menu_catalog" }]);

          await sendBotMessage(chatId, reply, buttons, isSimulated, collector);
        }
      } else if (callbackData.startsWith("prod_")) {
        // Product Details
        const prodId = callbackData.replace("prod_", "");
        const prod = db.products.find(p => p.id === prodId);

        if (!prod) {
          await sendBotMessage(
            chatId,
            "❌ Product not found or discontinued.",
            [[{ text: "⬅️ Back to Catalog", callbackData: "menu_catalog" }]],
            isSimulated,
            collector
          );
        } else {
          const isAvailable = prod.keys.length > 0;
          const detailText = `${prod.image} **${prod.name}**\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📝 **Description:**\n${prod.description}\n\n` +
            `💵 **Price:** $${prod.price.toFixed(2)}\n` +
            `📶 **Stock Status:** ${isAvailable ? `✅ **Available (${prod.keys.length} items)**` : "❌ **Out of Stock**"}\n` +
            `⭐️ **SoldCount:** ${prod.soldCount} delivered successfully\n\n` +
            `⚡️ _All orders are processed instantly and credentials are delivered in this chat right after checkout._`;

          const buttons = [];
          if (isAvailable) {
            buttons.push([{ text: `💳 Purchase for $${prod.price.toFixed(2)}`, callbackData: `buy_${prod.id}` }]);
          }
          buttons.push([{ text: "⬅️ Back", callbackData: `cat_${prod.category}` }]);

          await sendBotMessage(chatId, detailText, buttons, isSimulated, collector);
        }
      } else if (callbackData.startsWith("buy_")) {
        // Payment Options
        const prodId = callbackData.replace("buy_", "");
        const prod = db.products.find(p => p.id === prodId);

        if (!prod || prod.keys.length === 0) {
          await sendBotMessage(
            chatId,
            "❌ Product is out of stock or does not exist.",
            [[{ text: "⬅️ Back to Catalog", callbackData: "menu_catalog" }]],
            isSimulated,
            collector
          );
        } else {
          const buyText = `🛒 **Checkout Details:**\n` +
            `• Product: **${prod.name}**\n` +
            `• Price: **$${prod.price.toFixed(2)}**\n\n` +
            `💳 **Choose a payment gateway:**\n` +
            `Secure automated payments with instant delivery:`;

          const buttons = [
            [
              { text: "💳 Credit/Debit Card", callbackData: `pay_${prod.id}_card` },
              { text: "🪙 Bitcoin / Crypto", callbackData: `pay_${prod.id}_crypto` }
            ],
            [
              { text: "📱 Telegram Pay", callbackData: `pay_${prod.id}_telegram` }
            ],
            [
              { text: "⬅️ Cancel & Back", callbackData: `prod_${prod.id}` }
            ]
          ];

          await sendBotMessage(chatId, buyText, buttons, isSimulated, collector);
        }
      } else if (callbackData.startsWith("pay_")) {
        // Initiate Simulated Payment
        const parts = callbackData.split("_");
        // Format: pay_<prodId>_<method> or pay_sub_netflix_1m_card
        const method = parts[parts.length - 1] as 'card' | 'crypto' | 'telegram';
        const prodId = parts.slice(1, parts.length - 1).join("_");

        const prod = db.products.find(p => p.id === prodId);
        if (!prod || prod.keys.length === 0) {
          await sendBotMessage(
            chatId,
            "❌ Sorry, this item is no longer available in stock.",
            [[{ text: "⬅️ Back to Catalog", callbackData: "menu_catalog" }]],
            isSimulated,
            collector
          );
          return;
        }

        // Create deep order record
        const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
        const newOrder: Order = {
          id: orderId,
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          price: prod.price,
          status: "pending",
          createdAt: new Date().toISOString(),
          customerName: username,
          telegramUserId: String(chatId),
          deliveredKey: null,
          paymentMethod: method
        };

        db.orders.push(newOrder);
        saveDatabase(db);

        const methodNames = {
          card: "💳 Credit Card Secure Portal",
          crypto: "🪙 BTC/USDT Multi-Crypto Node",
          telegram: "📱 Telegram Quick Invoice"
        };

        const payMessage = `📝 **Invoice Generated: #${orderId}**\n` +
          `• Item: **${prod.name}**\n` +
          `• Total: **$${prod.price.toFixed(2)}**\n` +
          `• Gateway: **${methodNames[method]}**\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `⚠️ **Instructions:** Please tap 'Complete Payment' below. In our bot, payment processing takes less than 3 seconds. Once validated, your digital delivery is immediate.`;

        // Inside simulated flow, we send a special callback button "Complete Payment" that triggers fulfillment
        const actionButton = [{ text: `✅ Complete Payment ($${prod.price.toFixed(2)})`, callbackData: `fulfill_${orderId}` }];
        const cancelButton = [{ text: "❌ Cancel Order", callbackData: `cancel_${orderId}` }];

        await sendBotMessage(chatId, payMessage, [actionButton, cancelButton], isSimulated, collector);
      } else if (callbackData.startsWith("cancel_")) {
        const orderId = callbackData.replace("cancel_", "");
        db = loadDatabase();
        const orderIndex = db.orders.findIndex(o => o.id === orderId);
        if (orderIndex >= 0) {
          db.orders[orderIndex].status = "failed";
          saveDatabase(db);
        }
        await sendBotMessage(
          chatId,
          "❌ Order cancelled.",
          [[{ text: "🛍 Shop Products", callbackData: "menu_catalog" }]],
          isSimulated,
          collector
        );
      } else if (callbackData.startsWith("fulfill_")) {
        const orderId = callbackData.replace("fulfill_", "");
        db = loadDatabase();

        const order = db.orders.find(o => o.id === orderId);
        if (!order) {
          await sendBotMessage(
            chatId,
            "❌ Invoice session expired.",
            [[{ text: "🛍 Browse Products", callbackData: "menu_catalog" }]],
            isSimulated,
            collector
          );
          return;
        }

        if (order.status === "paid") {
          await sendBotMessage(
            chatId,
            `✅ Order already fulfilled!\nKey: \`${order.deliveredKey}\``,
            homeButtons,
            isSimulated,
            collector
          );
          return;
        }

        const product = db.products.find(p => p.id === order.productId);
        if (!product || product.keys.length === 0) {
          order.status = "failed";
          saveDatabase(db);
          await sendBotMessage(
            chatId,
            "❌ Payment confirmed, but unfortunately we just ran out of stock for this specific code. Please contact support for an immediate refund or restock!",
            [[{ text: "📞 Contact Support", callbackData: "menu_support" }]],
            isSimulated,
            collector
          );
          return;
        }

        // POP A KEY from the product keys array
        const key = product.keys.shift()!; // Remove first key
        product.soldCount += 1;

        // Save delivered key to order
        order.status = "paid";
        order.deliveredKey = key;

        saveDatabase(db);

        const deliveryText = `🎉 **Payment Verified! Immediate Delivery Completed**\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📦 **Product:** ${order.productName}\n` +
          `🆔 **Invoice ID:** \`${order.id}\`\n` +
          `🔑 **DELIVERED LICENSE / CODE:**\n\n` +
          `\`${key}\`\n\n` +
          `💡 _Tip: You can copy the code above by tapping on it directly. Thank you for shopping with us!_`;

        await sendBotMessage(chatId, deliveryText, homeButtons, isSimulated, collector);
      }

      // If it is real Telegram webhook, reply callback query so user doesn't see loading clock in client
      if (!isSimulated && callbackQueryId) {
        try {
          const token = db.settings.token;
          await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callback_query_id: callbackQueryId }),
          });
        } catch (e) {
          console.error("Failed to answer callback query", e);
        }
      }
    }
  }

  // API - Simulated Telegram Bot interface (React client calls this)
  app.post("/api/simulator/message", async (req, res) => {
    const { chatId, username, text } = req.body;
    if (!chatId) {
      return res.status(400).json({ error: "chatId is required for simulation" });
    }

    const mockUpdate = {
      message: {
        chat: { id: chatId, username: username || "web_tester" },
        text: text
      }
    };

    const collector: ChatMessage[] = [];
    try {
      await processBotEngineUpdate(mockUpdate, true, collector);
      res.json({ success: true, messages: collector });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/simulator/callback", async (req, res) => {
    const { chatId, username, callbackData } = req.body;
    if (!chatId || !callbackData) {
      return res.status(400).json({ error: "chatId and callbackData are required" });
    }

    const mockUpdate = {
      callback_query: {
        id: `cb_query_${Date.now()}`,
        from: { id: chatId, username: username || "web_tester" },
        message: {
          chat: { id: chatId },
          message_id: 1,
          text: ""
        },
        data: callbackData
      }
    };

    const collector: ChatMessage[] = [];
    try {
      await processBotEngineUpdate(mockUpdate, true, collector);
      res.json({ success: true, messages: collector });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // REAL TELEGRAM WEBHOOK INGRESS
  app.post("/api/telegram/webhook", async (req, res) => {
    // Process async update and send 200 OK immediately to Telegram to prevent timeouts and re-sends
    res.status(200).send("ok");

    const update = req.body;
    console.log("[Telegram API Webhook Input]", JSON.stringify(update));
    try {
      await processBotEngineUpdate(update, false);
    } catch (err) {
      console.error("Error processing Telegram API Webhook UPDATE", err);
    }
  });

  // API - Direct Checkout from the Web Store (mirror purchase functionality)
  app.post("/api/web/checkout", (req, res) => {
    const { productId, customerName, paymentMethod } = req.body;
    db = loadDatabase();

    const product = db.products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.keys.length === 0) {
      return res.status(400).json({ error: "Product is out of stock" });
    }

    const orderId = `ORD-W${Math.floor(10000 + Math.random() * 90000)}`;
    const deliveredKey = product.keys.shift()!;
    product.soldCount += 1;

    const newOrder: Order = {
      id: orderId,
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
      status: "paid",
      createdAt: new Date().toISOString(),
      customerName: customerName || "Web Customer",
      telegramUserId: null,
      deliveredKey: deliveredKey,
      paymentMethod: paymentMethod || "card"
    };

    db.orders.push(newOrder);
    saveDatabase(db);

    res.json({ success: true, order: newOrder, products: db.products });
  });

  // API - Get Analytics summary
  app.get("/api/analytics", (req, res) => {
    db = loadDatabase();
    const paidOrders = db.orders.filter(o => o.status === "paid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.price, 0);
    const totalSalesCount = paidOrders.length;

    // Unique customers
    const uniqueCustomers = new Set();
    db.orders.forEach(o => {
      if (o.customerName) uniqueCustomers.add(o.customerName);
    });
    const activeCustomersCount = uniqueCustomers.size;

    // Out of Stock products
    const outOfStockCount = db.products.filter(p => p.keys.length === 0).length;

    // Categories breakdown
    const categoryRevenue: Record<CategoryType, number> = {
      subscription: 0,
      coin: 0,
      vpn: 0,
      key: 0
    };
    const categorySales: Record<CategoryType, number> = {
      subscription: 0,
      coin: 0,
      vpn: 0,
      key: 0
    };

    paidOrders.forEach(o => {
      const cat = o.category;
      if (categoryRevenue[cat] !== undefined) {
        categoryRevenue[cat] += o.price;
        categorySales[cat] += 1;
      }
    });

    // Sales over past 7 days
    const past7Days: Record<string, { date: string; sales: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      past7Days[d.toISOString().slice(0, 10)] = { date: dateStr, sales: 0, revenue: 0 };
    }

    paidOrders.forEach(o => {
      const orderDateKey = o.createdAt.slice(0, 10);
      if (past7Days[orderDateKey]) {
        past7Days[orderDateKey].sales += 1;
        past7Days[orderDateKey].revenue += o.price;
      }
    });

    const salesHistory = Object.values(past7Days);

    const summary: AnalyticsSummary = {
      totalRevenue,
      totalSalesCount,
      activeCustomersCount,
      outOfStockCount,
      categoryRevenue,
      categorySales,
      salesHistory
    };

    res.json(summary);
  });

  // Express routing for static asset resolution or Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is booting on port ${PORT}`);
  });
}

startServer();
