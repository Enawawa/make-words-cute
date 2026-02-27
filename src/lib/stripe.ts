import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "免费版",
    nameEn: "Free",
    price: "¥0",
    priceEn: "$0",
    dailyLimit: 5,
    maxLanguages: 1,
    features: [
      "每日 5 次萌化",
      "单语言输出",
      "6 种风格",
      "基础语音输入",
    ],
  },
  pro: {
    name: "Pro 专业版",
    nameEn: "Pro",
    price: "¥29.9/月",
    priceEn: "$4.99/mo",
    dailyLimit: Infinity,
    maxLanguages: 5,
    features: [
      "无限次萌化",
      "5 种语言全解锁",
      "6 种风格全解锁",
      "语音输入",
      "优先响应速度",
      "专属客服支持",
    ],
  },
} as const;
