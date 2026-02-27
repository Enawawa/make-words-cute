"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useCallback, Suspense } from "react";
import Link from "next/link";

const PLANS = [
  {
    key: "free",
    name: "免费版",
    price: "¥0",
    period: "永久免费",
    emoji: "🎁",
    color: "border-gray-200",
    badge: "bg-gray-100 text-gray-600",
    features: [
      { text: "每日 5 次萌化", included: true },
      { text: "单语言输出", included: true },
      { text: "6 种风格", included: true },
      { text: "语音输入", included: true },
      { text: "多语言输出", included: false },
      { text: "无限使用次数", included: false },
      { text: "优先响应速度", included: false },
    ],
  },
  {
    key: "pro",
    name: "Pro 专业版",
    price: "$4.99",
    period: "/月",
    emoji: "👑",
    color: "border-[var(--color-primary)]",
    badge: "bg-gradient-to-r from-amber-400 to-orange-400 text-white",
    popular: true,
    features: [
      { text: "无限次萌化", included: true },
      { text: "5 种语言全解锁", included: true },
      { text: "6 种风格全解锁", included: true },
      { text: "语音输入", included: true },
      { text: "多语言同时输出", included: true },
      { text: "优先响应速度", included: true },
      { text: "专属客服支持", included: true },
    ],
  },
];

const PAYMENT_METHODS = [
  { name: "Visa/Mastercard", icon: "💳" },
  { name: "支付宝 Alipay", icon: "🔵" },
  { name: "Apple Pay", icon: "🍎" },
  { name: "Google Pay", icon: "🟢" },
];

function PricingContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);

  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  const isPro = session?.user?.plan === "pro";

  const handleCheckout = useCallback(async () => {
    setLoading("checkout");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "无法创建支付");
        setLoading(null);
      }
    } catch {
      alert("网络错误，请重试");
      setLoading(null);
    }
  }, []);

  const handlePortal = useCallback(async () => {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "无法打开管理页面");
        setLoading(null);
      }
    } catch {
      alert("网络错误，请重试");
      setLoading(null);
    }
  }, []);

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-extrabold cute-gradient-text">Make Words Cute</span>
          </Link>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--color-text)] mb-3">
            解锁萌化无限可能 ✨
          </h2>
          <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
            升级 Pro，尽享 5 种语言 × 6 种风格的无限萌化体验
          </p>
        </div>

        {/* Success / Cancel banners */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-center font-semibold animate-bounce-in">
            🎉 订阅成功！欢迎成为 Pro 会员，尽情萌化吧~
          </div>
        )}
        {canceled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-700 text-center animate-bounce-in">
            支付已取消，你可以随时重新订阅 ✨
          </div>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {PLANS.map((plan) => {
            const isCurrent = (session?.user?.plan || "free") === plan.key;
            return (
              <div
                key={plan.key}
                className={`relative bg-white rounded-3xl border-2 ${plan.color} p-8 transition-all hover:shadow-lg ${
                  plan.popular ? "shadow-lg" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--color-primary)] to-purple-500 text-white shadow-md">
                      🔥 最受欢迎
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <span className="text-4xl mb-2 block">{plan.emoji}</span>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-3">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f.text} className={`flex items-center gap-2 text-sm ${f.included ? "" : "text-gray-300"}`}>
                      <span>{f.included ? "✅" : "❌"}</span>
                      {f.text}
                    </li>
                  ))}
                </ul>

                {isCurrent && isPro && plan.key === "pro" ? (
                  <button
                    onClick={handlePortal}
                    disabled={loading === "portal"}
                    className="w-full py-3.5 rounded-2xl border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold transition-all hover:bg-pink-50"
                  >
                    {loading === "portal" ? "加载中..." : "💎 管理订阅"}
                  </button>
                ) : plan.key === "pro" && !isPro ? (
                  session ? (
                    <button
                      onClick={handleCheckout}
                      disabled={loading === "checkout"}
                      className="w-full py-3.5 rounded-2xl text-white font-bold cute-gradient transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading === "checkout" ? "跳转支付中..." : "✨ 立即升级 Pro"}
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="block w-full py-3.5 rounded-2xl text-center text-white font-bold cute-gradient transition-all hover:scale-[1.02]"
                    >
                      登录后升级
                    </Link>
                  )
                ) : (
                  <div className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-center text-gray-400 font-semibold">
                    {isCurrent ? "当前方案" : "基础方案"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Payment methods */}
        <div className="text-center mb-8">
          <p className="text-sm text-[var(--color-text-muted)] mb-3">支持多种支付方式</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {PAYMENT_METHODS.map((m) => (
              <span key={m.name} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 text-xs text-gray-500">
                {m.icon} {m.name}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-[var(--color-primary)] hover:underline">
            ← 返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <PricingContent />
    </Suspense>
  );
}
