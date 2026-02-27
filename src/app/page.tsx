"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { LANGUAGES, DEFAULT_LANG } from "@/lib/languages";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface StyleResult {
  style: string;
  emoji: string;
  text: string;
}

type ResultsMap = Record<string, StyleResult[]>;

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const STYLE_COLORS: Record<string, { card: string; badge: string }> = {
  /* zh-CN */
  傲娇猫猫: { card: "from-pink-50 to-rose-50 border-pink-200", badge: "bg-pink-100 text-pink-700" },
  奶凶奶凶: { card: "from-orange-50 to-amber-50 border-orange-200", badge: "bg-orange-100 text-orange-700" },
  高贵女王: { card: "from-purple-50 to-violet-50 border-purple-200", badge: "bg-purple-100 text-purple-700" },
  中二少年: { card: "from-red-50 to-rose-50 border-red-200", badge: "bg-red-100 text-red-700" },
  阴阳怪气: { card: "from-emerald-50 to-teal-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  赛博朋克: { card: "from-cyan-50 to-blue-50 border-cyan-200", badge: "bg-cyan-100 text-cyan-700" },
  /* zh-TW */
  傲嬌貓貓: { card: "from-pink-50 to-rose-50 border-pink-200", badge: "bg-pink-100 text-pink-700" },
  奶兇奶兇: { card: "from-orange-50 to-amber-50 border-orange-200", badge: "bg-orange-100 text-orange-700" },
  高貴女王: { card: "from-purple-50 to-violet-50 border-purple-200", badge: "bg-purple-100 text-purple-700" },
  陰陽怪氣: { card: "from-emerald-50 to-teal-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  台灣甜妹: { card: "from-amber-50 to-yellow-50 border-amber-200", badge: "bg-amber-100 text-amber-700" },
  /* en */
  "Tsundere Cat": { card: "from-pink-50 to-rose-50 border-pink-200", badge: "bg-pink-100 text-pink-700" },
  "UwU Baby": { card: "from-orange-50 to-amber-50 border-orange-200", badge: "bg-orange-100 text-orange-700" },
  "Sassy Queen": { card: "from-purple-50 to-violet-50 border-purple-200", badge: "bg-purple-100 text-purple-700" },
  "Anime Hero": { card: "from-red-50 to-rose-50 border-red-200", badge: "bg-red-100 text-red-700" },
  "Southern Shade": { card: "from-emerald-50 to-teal-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  "Internet Brain": { card: "from-cyan-50 to-blue-50 border-cyan-200", badge: "bg-cyan-100 text-cyan-700" },
  /* ja */
  ツンデレにゃん: { card: "from-pink-50 to-rose-50 border-pink-200", badge: "bg-pink-100 text-pink-700" },
  赤ちゃん言葉: { card: "from-orange-50 to-amber-50 border-orange-200", badge: "bg-orange-100 text-orange-700" },
  お嬢様: { card: "from-purple-50 to-violet-50 border-purple-200", badge: "bg-purple-100 text-purple-700" },
  中二病: { card: "from-red-50 to-rose-50 border-red-200", badge: "bg-red-100 text-red-700" },
  嫌味キャラ: { card: "from-emerald-50 to-teal-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  ネット民: { card: "from-cyan-50 to-blue-50 border-cyan-200", badge: "bg-cyan-100 text-cyan-700" },
  /* ko */
  "츤데레 냥이": { card: "from-pink-50 to-rose-50 border-pink-200", badge: "bg-pink-100 text-pink-700" },
  애교만렙: { card: "from-orange-50 to-amber-50 border-orange-200", badge: "bg-orange-100 text-orange-700" },
  "도도 퀸": { card: "from-purple-50 to-violet-50 border-purple-200", badge: "bg-purple-100 text-purple-700" },
  중2병: { card: "from-red-50 to-rose-50 border-red-200", badge: "bg-red-100 text-red-700" },
  "비꼼 장인": { card: "from-emerald-50 to-teal-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  "인싸 밈러": { card: "from-cyan-50 to-blue-50 border-cyan-200", badge: "bg-cyan-100 text-cyan-700" },
};

const DEFAULT_COLORS = {
  card: "from-gray-50 to-slate-50 border-gray-200",
  badge: "bg-gray-100 text-gray-700",
};

const EXAMPLES = [
  "草你大爷的，滚蛋！",
  "你脑子有病吧，废物",
  "他妈的，这什么垃圾",
  "闭嘴，傻逼",
  "卧槽你是不是智障",
  "去死吧混蛋",
];

/* ------------------------------------------------------------------ */
/*  Voice Input Hook                                                  */
/* ------------------------------------------------------------------ */

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
        const r = event.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (finalText) onTranscript(finalText);
      setInterim(interimText);
    };
    recognition.onend = () => { setIsListening(false); setInterim(""); };
    recognition.onerror = () => { setIsListening(false); setInterim(""); };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, onTranscript]);

  return { isListening, interim, isSupported, toggle };
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

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

function StyleCard({ result, index }: { result: StyleResult; index: number }) {
  const [copied, setCopied] = useState(false);
  const colors = STYLE_COLORS[result.style] || DEFAULT_COLORS;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div
      className={`relative rounded-2xl border bg-gradient-to-br ${colors.card} p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-card-in`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
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
      <p className="text-base leading-relaxed whitespace-pre-wrap">{result.text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [input, setInput] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<Set<string>>(new Set([DEFAULT_LANG]));
  const [results, setResults] = useState<ResultsMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(DEFAULT_LANG);
  const [allCopied, setAllCopied] = useState(false);

  const handleVoiceTranscript = useCallback(
    (text: string) => setInput((prev) => prev + text),
    []
  );
  const voice = useVoiceInput(handleVoiceTranscript);

  /* language toggle */
  const toggleLang = useCallback((code: string) => {
    setSelectedLangs((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        if (next.size > 1) next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }, []);

  const selectAllLangs = useCallback(() => {
    const allSelected = selectedLangs.size === LANGUAGES.length;
    if (allSelected) {
      setSelectedLangs(new Set([DEFAULT_LANG]));
    } else {
      setSelectedLangs(new Set(LANGUAGES.map((l) => l.code)));
    }
  }, [selectedLangs.size]);

  /* transform */
  const handleTransform = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setResults({});

    const langs = Array.from(selectedLangs);
    setActiveTab(langs[0]);

    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, languages: langs }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "出了点问题呢~");
        return;
      }
      setResults(data.results || {});
    } catch {
      setError("网络开小差啦，再试试叭~ 🌐");
    } finally {
      setLoading(false);
    }
  }, [input, selectedLangs]);

  /* copy all for active tab */
  const handleCopyAll = useCallback(async () => {
    const items = results[activeTab];
    if (!items?.length) return;
    const lang = LANGUAGES.find((l) => l.code === activeTab);
    const header = lang ? `${lang.flag} ${lang.nativeName}` : activeTab;
    const allText = `--- ${header} ---\n\n` + items.map((r) => `【${r.emoji} ${r.style}】\n${r.text}`).join("\n\n");
    try {
      await navigator.clipboard.writeText(allText);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  }, [results, activeTab]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleTransform();
    },
    [handleTransform]
  );

  /* derived */
  const resultLangs = Object.keys(results);
  const activeResults = results[activeTab] || [];

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
      <header className="pt-10 pb-3 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold cute-gradient-text mb-3">
          Make Words Cute
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-xl mx-auto">
          🎀 把你的暴躁话话变成又凶又萌的样子 🎀
        </p>
        <p className="text-sm text-[var(--color-text-muted)] mt-1.5 opacity-70">
          Powered by AI · 5种语言 · 6种风格 · 语音输入 🎤
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-4">
        {/* ---- Input Card ---- */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-pink-100">
          {/* Textarea */}
          <div className="mb-4">
            <label htmlFor="angry-input" className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
              💢 输入你想说的暴躁话（支持任何语言输入）
            </label>
            <textarea
              id="angry-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='随便哪种语言都行… 比如「草你大爷的」「Shut the f*** up」「うざい消えろ」'
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 bg-pink-50/50 text-base resize-none transition-all duration-200 hover:border-pink-300 focus:border-[var(--color-primary)]"
            />
            {voice.isListening && voice.interim && (
              <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 animate-bounce-in">
                🎙️ 正在听... <span className="font-medium">{voice.interim}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-1 text-xs text-[var(--color-text-muted)]">
              <span>⌘/Ctrl + Enter 快速发送</span>
              <span>{input.length}/500</span>
            </div>
          </div>

          {/* Language selector */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-[var(--color-text-muted)]">🌐 选择输出语言</label>
              <button
                onClick={selectAllLangs}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                {selectedLangs.size === LANGUAGES.length ? "只保留简中" : "全选"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const active = selectedLangs.has(lang.code);
                return (
                  <button
                    key={lang.code}
                    onClick={() => toggleLang(lang.code)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                      active
                        ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm"
                        : "bg-white border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500"
                    }`}
                  >
                    {lang.flag} {lang.nativeName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {voice.isSupported && (
              <button
                onClick={voice.toggle}
                className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                  voice.isListening
                    ? "bg-red-500 border-red-400 text-white animate-mic-pulse"
                    : "bg-white border-pink-200 text-pink-500 hover:border-pink-400 hover:bg-pink-50"
                }`}
                title={voice.isListening ? "停止录音" : "语音输入"}
              >
                {voice.isListening ? "⏹️" : "🎤"}
              </button>
            )}
            <button
              onClick={handleTransform}
              disabled={loading || !input.trim()}
              className="flex-1 py-4 rounded-2xl text-white font-bold text-lg cute-gradient transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {selectedLangs.size}种语言萌化中...
                </span>
              ) : (
                `✨ 一键萌化 · ${selectedLangs.size}种语言 × 6风格 ✨`
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm animate-bounce-in">
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="mt-8">
            <p className="text-center text-sm font-semibold text-[var(--color-text-muted)] mb-4">
              🪄 AI 正在为 {selectedLangs.size} 种语言施展萌化魔法...
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        )}

        {/* ---- Results with Language Tabs ---- */}
        {resultLangs.length > 0 && !loading && (
          <div className="mt-8 animate-bounce-in">
            {/* Tab bar */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              {resultLangs.map((code) => {
                const lang = LANGUAGES.find((l) => l.code === code);
                const isActive = code === activeTab;
                return (
                  <button
                    key={code}
                    onClick={() => setActiveTab(code)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                      isActive
                        ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-md"
                        : "bg-white border-gray-200 text-gray-500 hover:border-pink-300"
                    }`}
                  >
                    {lang?.flag} {lang?.nativeName || code}
                  </button>
                );
              })}

              {/* Spacer + copy all */}
              <div className="flex-1" />
              <button
                onClick={handleCopyAll}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 transition-all hover:scale-105 active:scale-95"
              >
                {allCopied ? "✅ 已复制" : "📋 复制当前语言"}
              </button>
            </div>

            {/* Style cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeResults.map((result, i) => (
                <StyleCard key={`${activeTab}-${result.style}-${i}`} result={result} index={i} />
              ))}
            </div>

            {/* Language count info */}
            <p className="text-center text-xs text-[var(--color-text-muted)] mt-4 opacity-60">
              已生成 {resultLangs.length} 种语言 × 每种 {activeResults.length} 个风格 = {resultLangs.length * (activeResults.length || 6)} 种萌化结果
            </p>
          </div>
        )}

        {/* ---- Examples ---- */}
        <div className="mt-10">
          <h2 className="text-center text-sm font-semibold text-[var(--color-text-muted)] mb-4">
            💡 试试这些暴躁名句（点击即可使用）
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EXAMPLES.map((text) => (
              <button
                key={text}
                onClick={() => { setInput(text); setResults({}); setError(""); }}
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
