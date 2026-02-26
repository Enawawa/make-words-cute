"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/* ---------- Types ---------- */

interface StyleResult {
  style: string;
  emoji: string;
  text: string;
}

/* ---------- Constants ---------- */

const STYLE_COLORS: Record<string, { card: string; badge: string }> = {
  傲娇猫猫: { card: "from-pink-50 to-rose-50 border-pink-200", badge: "bg-pink-100 text-pink-700" },
  奶凶奶凶: { card: "from-orange-50 to-amber-50 border-orange-200", badge: "bg-orange-100 text-orange-700" },
  高贵女王: { card: "from-purple-50 to-violet-50 border-purple-200", badge: "bg-purple-100 text-purple-700" },
  中二少年: { card: "from-red-50 to-rose-50 border-red-200", badge: "bg-red-100 text-red-700" },
  阴阳怪气: { card: "from-emerald-50 to-teal-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  赛博朋克: { card: "from-cyan-50 to-blue-50 border-cyan-200", badge: "bg-cyan-100 text-cyan-700" },
};

const DEFAULT_COLORS = {
  card: "from-gray-50 to-slate-50 border-gray-200",
  badge: "bg-gray-100 text-gray-700",
};

const EXAMPLES = [
  "草你大爷的，滚蛋！",
  "你脑子有病吧，废物",
  "他妈的，这什么垃圾东西",
  "闭嘴，傻逼",
  "卧槽你是不是智障",
  "去死吧混蛋",
];

/* ---------- Voice Input Hook ---------- */

function useVoiceInput(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
        !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }, []);

  const toggle = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterim("");
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      if (finalText) onTranscript(finalText);
      setInterim(interimText);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterim("");
    };

    recognition.onerror = () => {
      setIsListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, onTranscript]);

  return { isListening, interim, isSupported, toggle };
}

/* ---------- Sub-components ---------- */

function FloatingEmoji({ emoji, className }: { emoji: string; className: string }) {
  return (
    <span className={`absolute text-2xl select-none pointer-events-none animate-float ${className}`} aria-hidden>
      {emoji}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="w-20 h-4 rounded bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="w-full h-4 rounded bg-gray-100" />
        <div className="w-3/4 h-4 rounded bg-gray-100" />
      </div>
    </div>
  );
}

function StyleCard({
  result,
  index,
}: {
  result: StyleResult;
  index: number;
}) {
  const [copied, setCopied] = useState(false);
  const colors = STYLE_COLORS[result.style] || DEFAULT_COLORS;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard may be unavailable */ }
  };

  return (
    <div
      className={`relative rounded-2xl border bg-gradient-to-br ${colors.card} p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-card-in`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
          {result.emoji} {result.style}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg bg-white/70 hover:bg-white border border-black/5 transition-all hover:scale-110 active:scale-95 text-sm"
          title="复制"
        >
          {copied ? "✅" : "📋"}
        </button>
      </div>
      {/* Body */}
      <p className="text-base leading-relaxed whitespace-pre-wrap">{result.text}</p>
    </div>
  );
}

/* ---------- Main Page ---------- */

export default function Home() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<StyleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allCopied, setAllCopied] = useState(false);

  const handleVoiceTranscript = useCallback(
    (text: string) => setInput((prev) => prev + text),
    []
  );

  const voice = useVoiceInput(handleVoiceTranscript);

  const handleTransform = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "出了点问题呢~");
        return;
      }

      setResults(data.results || []);
    } catch {
      setError("网络开小差啦，再试试叭~ 🌐");
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleCopyAll = useCallback(async () => {
    if (results.length === 0) return;
    const allText = results
      .map((r) => `【${r.emoji} ${r.style}】\n${r.text}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(allText);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    } catch { /* clipboard may be unavailable */ }
  }, [results]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleTransform();
    },
    [handleTransform]
  );

  return (
    <main className="relative min-h-screen overflow-hidden pb-16">
      {/* Floating decorations */}
      <FloatingEmoji emoji="🌸" className="top-[10%] left-[5%]" />
      <FloatingEmoji emoji="✨" className="top-[15%] right-[10%]" />
      <FloatingEmoji emoji="🎀" className="top-[55%] left-[3%]" />
      <FloatingEmoji emoji="💖" className="top-[70%] right-[5%]" />
      <FloatingEmoji emoji="🐱" className="top-[35%] right-[3%]" />
      <FloatingEmoji emoji="🌈" className="top-[85%] left-[10%]" />
      <FloatingEmoji emoji="⭐" className="top-[45%] left-[6%]" />

      {/* Header */}
      <header className="pt-10 pb-4 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold cute-gradient-text mb-3">
          Make Words Cute
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-xl mx-auto">
          🎀 把你的暴躁话话变成又凶又萌的样子 🎀
        </p>
        <p className="text-sm text-[var(--color-text-muted)] mt-1.5 opacity-70">
          Powered by AI · 6种风格 · 支持语音输入 🎤
        </p>
      </header>

      {/* Main card */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-pink-100">
          {/* Input */}
          <div className="mb-5">
            <label htmlFor="angry-input" className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
              💢 输入你想说的暴躁话
            </label>
            <div className="relative">
              <textarea
                id="angry-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='在这里输入你的暴躁发言，或点击🎤语音输入… 比如「草你大爷的」'
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 bg-pink-50/50 text-base resize-none transition-all duration-200 hover:border-pink-300 focus:border-[var(--color-primary)]"
              />
            </div>

            {/* Voice interim transcript */}
            {voice.isListening && voice.interim && (
              <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 animate-bounce-in">
                🎙️ 正在听... <span className="font-medium">{voice.interim}</span>
              </div>
            )}

            <div className="flex justify-between items-center mt-1.5 text-xs text-[var(--color-text-muted)]">
              <span>⌘/Ctrl + Enter 快速发送</span>
              <span>{input.length}/500</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {/* Voice button */}
            {voice.isSupported && (
              <button
                onClick={voice.toggle}
                className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all duration-200 hover:scale-105 active:scale-95
                  ${voice.isListening
                    ? "bg-red-500 border-red-400 text-white animate-mic-pulse"
                    : "bg-white border-pink-200 text-pink-500 hover:border-pink-400 hover:bg-pink-50"
                  }`}
                title={voice.isListening ? "停止录音" : "语音输入"}
              >
                {voice.isListening ? "⏹️" : "🎤"}
              </button>
            )}

            {/* Transform button */}
            <button
              onClick={handleTransform}
              disabled={loading || !input.trim()}
              className="flex-1 py-4 rounded-2xl text-white font-bold text-lg cute-gradient transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  六种风格萌化中...
                </span>
              ) : (
                "✨ 一键萌化 · 6种风格 ✨"
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm animate-bounce-in max-w-3xl mx-auto">
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="mt-8">
            <h2 className="text-center text-sm font-semibold text-[var(--color-text-muted)] mb-4">
              🪄 AI 正在施展萌化魔法...
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && !loading && (
          <div className="mt-8 animate-bounce-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--color-text-muted)]">
                🎀 萌化结果 — {results.length}种风格
              </h2>
              <button
                onClick={handleCopyAll}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 transition-all hover:scale-105 active:scale-95"
              >
                {allCopied ? "✅ 已复制全部" : "📋 复制全部"}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result, i) => (
                <StyleCard key={`${result.style}-${i}`} result={result} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        <div className="mt-10">
          <h2 className="text-center text-sm font-semibold text-[var(--color-text-muted)] mb-4">
            💡 试试这些暴躁名句（点击即可使用）
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EXAMPLES.map((text) => (
              <button
                key={text}
                onClick={() => {
                  setInput(text);
                  setResults([]);
                  setError("");
                }}
                className="group p-3 bg-white rounded-xl border border-pink-100 text-left text-sm transition-all duration-200 hover:border-pink-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <span className="text-red-400 group-hover:text-[var(--color-primary)] transition-colors">
                  &ldquo;{text}&rdquo;
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-[var(--color-text-muted)] opacity-60">
          <p>Made with 💖 by Make Words Cute</p>
          <p className="mt-1">用 AI 的力量让世界多一点可爱 ✨</p>
        </footer>
      </div>
    </main>
  );
}
