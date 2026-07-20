export type CategoryType = 'subscription' | 'coin' | 'vpn' | 'key';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryType;
  image: string; // Emoji or short name representing icon
  keys: string[]; // List of available pre-loaded keys/files
  soldCount: number;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  category: CategoryType;
  price: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  customerName: string; // "john_doe" or "Web Customer #1"
  telegramUserId: string | null;
  deliveredKey: string | null;
  paymentMethod: 'card' | 'crypto' | 'telegram';
}

export interface BotSettings {
  token: string;
  webhookUrl: string;
  welcomeMessage: string;
  supportLink: string;
  paymentSimulateOnly: boolean;
  isWebhookSet: boolean;
}

export interface InlineButton {
  text: string;
  callbackData: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  buttons?: InlineButton[][]; // Inline Keyboard
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalSalesCount: number;
  activeCustomersCount: number;
  outOfStockCount: number;
  categoryRevenue: Record<CategoryType, number>;
  categorySales: Record<CategoryType, number>;
  salesHistory: { date: string; sales: number; revenue: number }[];
}
