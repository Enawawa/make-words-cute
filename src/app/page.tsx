"use client";

import { useState, useCallback } from "react";

const EXAMPLE_PAIRS = [
  { angry: "他妈的", cute: '他妈咪的 (╬ Ĺ̯ ╬)' },
  { angry: "去你大爷的", cute: "去你 grandpa 的~ 哼！💢" },
  { angry: "滚", cute: "给我滚成球球滚走啦 🏀💨" },
  { angry: "你脑子有病吧", cute: "你的小脑袋瓜是不是进水水啦 🧠💦" },
  { angry: "闭嘴", cute: "请把你的小嘴嘴拉上拉链 🤐✨" },
  { angry: "傻逼", cute: "小傻瓜蛋 (っ˘̩╭╮˘̩)っ" },
];

function FloatingEmoji({
  emoji,
  className,
}: {
  emoji: string;
  className: string;
}) {
  return (
    <span
      className={`absolute text-2xl select-none pointer-events-none animate-float ${className}`}
      aria-hidden
    >
      {emoji}
    </span>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTransform = useCallback(async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "出了点问题呢~");
        return;
      }

      setOutput(data.cuteText);
    } catch {
      setError("网络开小差啦，再试试叭~ 🌐");
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may not be available */
    }
  }, [output]);

  const handleExampleClick = useCallback((text: string) => {
    setInput(text);
    setOutput("");
    setError("");
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        handleTransform();
      }
    },
    [handleTransform]
  );

  return (
    <main className="relative min-h-screen overflow-hidden pb-12">
      {/* Floating decorations */}
      <FloatingEmoji emoji="🌸" className="top-[10%] left-[5%]" />
      <FloatingEmoji
        emoji="✨"
        className="top-[15%] right-[10%]"
        />
      <FloatingEmoji
        emoji="🎀"
        className="top-[60%] left-[8%]"
        />
      <FloatingEmoji
        emoji="💖"
        className="top-[70%] right-[5%]"
        />
      <FloatingEmoji
        emoji="🐱"
        className="top-[40%] right-[3%]"
        />
      <FloatingEmoji
        emoji="🌈"
        className="top-[85%] left-[15%]"
        />

      {/* Header */}
      <header className="pt-12 pb-6 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold cute-gradient-text mb-4">
          Make Words Cute
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-lg mx-auto">
          🎀 把你的暴躁话话变成又凶又萌的样子 🎀
        </p>
        <p className="text-sm text-[var(--color-text-muted)] mt-2 opacity-70">
          Powered by AI · 攻击性不减，可爱度拉满
        </p>
      </header>

      {/* Main card */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-pink-100">
          {/* Input */}
          <div className="mb-6">
            <label
              htmlFor="angry-input"
              className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2"
            >
              💢 输入你想说的暴躁话
            </label>
            <textarea
              id="angry-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="在这里输入你的暴躁发言... 比如「你脑子有病吧」"
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 bg-pink-50/50 text-base resize-none transition-all duration-200 hover:border-pink-300 focus:border-[var(--color-primary)]"
            />
            <div className="flex justify-between items-center mt-1 text-xs text-[var(--color-text-muted)]">
              <span>⌘/Ctrl + Enter 快速发送</span>
              <span>{input.length}/500</span>
            </div>
          </div>

          {/* Transform button */}
          <button
            onClick={handleTransform}
            disabled={loading || !input.trim()}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg cute-gradient transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                萌化中...
              </span>
            ) : (
              "✨ 一键萌化 ✨"
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm animate-bounce-in">
              {error}
            </div>
          )}

          {/* Output */}
          {output && (
            <div className="mt-6 animate-bounce-in">
              <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
                🎀 萌化结果
              </label>
              <div className="relative p-5 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-pink-200">
                <p className="text-lg leading-relaxed whitespace-pre-wrap pr-10">
                  {output}
                </p>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 hover:bg-white border border-pink-200 transition-all duration-200 hover:scale-110 active:scale-95"
                  title="复制"
                >
                  {copied ? "✅" : "📋"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Examples section */}
        <div className="mt-8">
          <h2 className="text-center text-sm font-semibold text-[var(--color-text-muted)] mb-4">
            💡 试试这些例子（点击即可使用）
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAMPLE_PAIRS.map((pair) => (
              <button
                key={pair.angry}
                onClick={() => handleExampleClick(pair.angry)}
                className="group p-4 bg-white rounded-2xl border border-pink-100 text-left transition-all duration-200 hover:border-pink-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="text-sm text-red-400 line-through mb-1">
                  {pair.angry}
                </div>
                <div className="text-sm text-[var(--color-primary)]">
                  → {pair.cute}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-[var(--color-text-muted)] opacity-60">
          <p>Made with 💖 by Make Words Cute</p>
          <p className="mt-1">
            用 AI 的力量让世界多一点可爱 ✨
          </p>
        </footer>
      </div>
    </main>
  );
}
