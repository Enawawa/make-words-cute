"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";

const PLANS = [
  {
    key: "free",
    name: "免费版",
    price: "¥0",
    period: "永久免费",
    emoji: "🎁",
    color: "border-gray-200",
    features: [
      { text: "每日 5 次萌化", ok: true },
      { text: "单语言输出", ok: true },
      { text: "6 种风格", ok: true },
      { text: "语音输入", ok: true },
      { text: "多语言输出", ok: false },
      { text: "无限使用次数", ok: false },
    ],
  },
  {
    key: "pro",
    name: "Pro 专业版",
    price: "¥19.9",
    period: "/月",
    emoji: "👑",
    color: "border-[var(--color-primary)]",
    popular: true,
    features: [
      { text: "无限次萌化", ok: true },
      { text: "5 种语言全解锁", ok: true },
      { text: "6 种风格全解锁", ok: true },
      { text: "语音输入", ok: true },
      { text: "多语言同时输出", ok: true },
      { text: "优先响应速度", ok: true },
    ],
  },
];

function PricingContent() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [orderId, setOrderId] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const success = searchParams.get("success") === "true";
  const isPro = session?.user?.plan === "pro";

  /* 轮询订单状态 */
  useEffect(() => {
    if (!orderId || paymentDone) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pay/wechat?orderId=${orderId}`);
        const data = await res.json();
        if (data.status === "paid") {
          setPaymentDone(true);
          clearInterval(interval);
          await update({ plan: "pro" });
        }
      } catch { /* ignore */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [orderId, paymentDone, update]);

  const handlePay = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pay/wechat", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { alert(data.error); setLoading(false); return; }
      setQrUrl(data.qrUrl);
      setOrderId(data.orderId);
      setTestMode(data.testMode || false);
      setShowQr(true);
    } catch {
      alert("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
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

        {(success || paymentDone) && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-center font-semibold animate-bounce-in">
            🎉 支付成功！欢迎成为 Pro 会员，尽情萌化吧~
          </div>
        )}

        {/* 微信支付弹窗 */}
        {showQr && !paymentDone && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowQr(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-in" onClick={(e) => e.stopPropagation()}>
              <div className="text-4xl mb-3">💚</div>
              <h3 className="text-lg font-bold mb-1">微信扫码支付</h3>
              <p className="text-sm text-gray-500 mb-4">Pro 专业版 · ¥19.9/月</p>
              {testMode && (
                <div className="mb-3 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-600">
                  🧪 测试模式：3秒后自动确认支付
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="微信支付二维码" className="w-56 h-56 mx-auto rounded-xl border border-gray-200" />
              <p className="text-xs text-gray-400 mt-3">打开微信 → 扫一扫 → 完成支付</p>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                等待支付中...
              </div>
              <button onClick={() => setShowQr(false)} className="mt-4 text-xs text-gray-400 hover:text-gray-600">
                取消支付
              </button>
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {PLANS.map((plan) => {
            const isCurrent = (session?.user?.plan || "free") === plan.key;
            return (
              <div
                key={plan.key}
                className={`relative bg-white rounded-3xl border-2 ${plan.color} p-8 transition-all hover:shadow-lg ${plan.popular ? "shadow-lg" : ""}`}
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
                    <li key={f.text} className={`flex items-center gap-2 text-sm ${f.ok ? "" : "text-gray-300"}`}>
                      <span>{f.ok ? "✅" : "❌"}</span>{f.text}
                    </li>
                  ))}
                </ul>

                {plan.key === "pro" && !isPro ? (
                  session ? (
                    <button
                      onClick={handlePay}
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl text-white font-bold cute-gradient transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? "创建订单中..." : "💚 微信支付 · ¥19.9/月"}
                    </button>
                  ) : (
                    <Link href="/login" className="block w-full py-3.5 rounded-2xl text-center text-white font-bold cute-gradient">
                      登录后升级
                    </Link>
                  )
                ) : (
                  <div className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-center text-gray-400 font-semibold">
                    {isCurrent && isPro ? "👑 当前方案" : "当前方案"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-[var(--color-text-muted)] mb-3">支持支付方式</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-green-200 text-xs text-green-600 font-semibold">
              💚 微信支付
            </span>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-[var(--color-primary)] hover:underline">← 返回首页</Link>
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
