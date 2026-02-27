"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (status === "loading") {
    return <div className="w-9 h-9 rounded-full bg-pink-100 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 rounded-full text-sm font-semibold bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
      >
        登录
      </Link>
    );
  }

  const isPro = session.user.plan === "pro";
  const initials = (session.user.name || session.user.email || "U")[0].toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-pink-50 transition-colors"
      >
        {session.user.image ? (
          <img src={session.user.image} alt="" className="w-9 h-9 rounded-full border-2 border-pink-200" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
        )}
        {isPro && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-white">
            PRO
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-pink-100 p-3 z-50 animate-card-in">
          <div className="px-3 py-2 border-b border-gray-100 mb-2">
            <p className="font-semibold text-sm truncate">{session.user.name || "用户"}</p>
            <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isPro
                  ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {isPro ? "Pro 专业版" : "免费版"}
            </span>
          </div>

          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm rounded-lg hover:bg-pink-50 transition-colors"
          >
            {isPro ? "💎 管理订阅" : "✨ 升级 Pro"}
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-red-500 transition-colors"
          >
            🚪 退出登录
          </button>
        </div>
      )}
    </div>
  );
}
