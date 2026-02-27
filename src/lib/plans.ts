export const PLANS = {
  free: {
    name: "免费版",
    price: "¥0",
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
    price: "¥19.9/月",
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
