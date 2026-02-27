"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const startCountdown = useCallback(() => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendOtp = useCallback(async () => {
    if (!email.includes("@")) { setError("请输入有效的邮箱地址"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep("code");
      startCountdown();
    } catch {
      setError("发送失败，请重试");
    } finally {
      setLoading(false);
    }
  }, [email, startCountdown]);

  const handleVerifyOtp = useCallback(async () => {
    if (code.length !== 6) { setError("请输入 6 位验证码"); return; }
    setLoading(true);
    setError("");
    try {
      const result = await signIn("email-otp", {
        email,
        code,
        redirect: false,
      });
      if (result?.error) {
        setError("验证码错误或已过期");
        setLoading(false);
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("登录失败，请重试");
      setLoading(false);
    }
  }, [email, code]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-extrabold cute-gradient-text">Make Words Cute</h1>
          </Link>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">登录后即可使用萌化功能 ✨</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-6">
          <h2 className="text-center text-sm font-semibold text-[var(--color-text-muted)] mb-5">📧 邮箱验证码登录</h2>

          {step === "email" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">邮箱地址</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 bg-pink-50/30 text-base focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading || !email}
                className="w-full py-3.5 rounded-2xl text-white font-bold cute-gradient disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? "发送中..." : "发送验证码"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-center text-[var(--color-text-muted)]">
                验证码已发送至 <span className="font-semibold text-[var(--color-primary)]">{email}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">6 位验证码</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 bg-pink-50/30 text-center text-2xl font-mono tracking-[0.5em] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  autoFocus
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading || code.length !== 6}
                className="w-full py-3.5 rounded-2xl text-white font-bold cute-gradient disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? "验证中..." : "登录"}
              </button>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <button onClick={() => { setStep("email"); setCode(""); setError(""); }} className="hover:text-[var(--color-primary)]">
                  ← 换个邮箱
                </button>
                <button onClick={handleSendOtp} disabled={countdown > 0} className="hover:text-[var(--color-primary)] disabled:opacity-50">
                  {countdown > 0 ? `${countdown}s 后重新发送` : "重新发送"}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center animate-bounce-in">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          登录即表示你同意我们的服务条款和隐私政策
        </p>
      </div>
    </main>
  );
}
