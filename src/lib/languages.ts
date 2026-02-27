export interface Language {
  code: string;
  flag: string;
  name: string;
  nativeName: string;
}

export const LANGUAGES: Language[] = [
  { code: "zh-CN", flag: "🇨🇳", name: "Simplified Chinese", nativeName: "简体中文" },
  { code: "zh-TW", flag: "🇹🇼", name: "Traditional Chinese", nativeName: "繁體中文" },
  { code: "en", flag: "🇬🇧", name: "English", nativeName: "English" },
  { code: "ja", flag: "🇯🇵", name: "Japanese", nativeName: "日本語" },
  { code: "ko", flag: "🇰🇷", name: "Korean", nativeName: "한국어" },
];

export const DEFAULT_LANG = "zh-CN";
